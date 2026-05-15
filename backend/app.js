import express from 'express'
import cors from 'cors'
import argon2 from 'argon2'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import session from 'express-session'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 1000 * 60 * 30
  }
}))

const DATA_DIR = path.join(__dirname, 'data')
const USERS_FILE = process.env.USERS_FILE || path.join(DATA_DIR, 'users.json')
const REVIEWS_FILE = process.env.REVIEWS_FILE || path.join(DATA_DIR, 'reviews.json')

const allowedOrigins = [
    'http://localhost:5173',
    'http://195.148.31.149:5173'
]

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null,true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true
  })
)
app.use(express.json())

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function makeUniqueSlug(baseSlug, users, currentUserId = null) {
  const safeBase = baseSlug || 'user'
  let slug = safeBase
  let count = 1

  while (users.some((user) => user.id !== currentUserId && user.slug === slug)) {
    slug = `${safeBase}-${count}`
    count += 1
  }

  return slug
}

async function readJson(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(filePath, '[]', 'utf-8')
      return []
    }
    throw error
  }
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

function getSafeUser(user) {
  return {
    id: user.id,
    username: user.username,
    slug: user.slug,
    email: user.email
  }
}

function validatePassword(password) {
  const checks = {
    minLength: password.length >= 8,
    upperAndLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  }

  return {
    valid: Object.values(checks).every(Boolean),
    checks
  }
}

function validateUsername(username) {
  return /^[a-zA-Z0-9_-]{3,20}$/.test(username)
}


app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' })
    }

    if (!validateUsername(username)) {
      return res.status(400).json({ error: 'Username is invalid.' })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'Password does not meet the required conditions.',
        checks: passwordValidation.checks
      })
    }

    const users = await readJson(USERS_FILE)

    const existingUser = users.find(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() ||
        user.username.toLowerCase() === username.toLowerCase()
    )

    if (existingUser) {
      return res.status(409).json({ error: 'User with that email or username already exists.' })
    }

    const baseSlug = slugify(username)
    const slug = makeUniqueSlug(baseSlug, users)

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1
    })

    const newUser = {
      id: crypto.randomUUID(),
      username: username.trim(),
      slug,
      email: email.trim(),
      passwordHash,
      createdAt: new Date().toISOString()
    }

    users.push(newUser)
    await writeJson(USERS_FILE, users)

    req.session.userId = newUser.id

    req.session.save((err) => {
      if (err) {
        console.error('Register sessions save error:', err)
        return res.status(500).json({ error: 'Failed to create session.'})
      }
      
      res.status(201).json({
        user: getSafeUser(newUser)
      })
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Server error during registration.' })
  }  
}) 

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    const users = await readJson(USERS_FILE)

    const matchedUser = users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    )

    if (!matchedUser) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const validPassword = await argon2.verify(matchedUser.passwordHash, password)

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    req.session.userId = matchedUser.id
    
    req.session.save((err) => {
      if (err) {
        console.error('Register session save error:', err)
        return res.status(500).json({ error: 'Failed to create session.'})
      }
      res.status(201).json({
        user: getSafeUser(matchedUser)
      })
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Server error during login.' })
  }
})

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true })
  })
})

app.get('/api/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated.' })
  }

  const users = await readJson(USERS_FILE)
  const user = users.find((u) => u.id === req.session.userId)

  if (!user) {
    return res.status(401).json({ error: 'Not authenticated.' })
  }

  res.json({ user: getSafeUser(user) })
})


app.get('/api/profile/:slug', async (req, res) => {
  try {
    const { slug } = req.params
    const users = await readJson(USERS_FILE)
    const reviews = await readJson(REVIEWS_FILE)

    const user = users.find((entry) => entry.slug === slug)

    if (!user) {
      const seededReviews = reviews.filter((review) => review.userSlug === slug)

      if (!seededReviews.length) {
        return res.status(404).json({ error: 'Profile not found.' })
      }

      return res.json({
        user: {
          username: seededReviews[0].userName,
          slug
        },
        reviews: seededReviews
      })
    }

    const userReviews = reviews.filter((review) => review.userSlug === user.slug)

    res.json({
      user: {
        username: user.username,
        slug: user.slug
      },
      reviews: userReviews
    })
  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({ error: 'Server error while loading profile.' })
  }
})


function validateReview({ title, rating, comment }) {
  if (title.trim().length < 3 || title.trim().length > 100) {
    return 'Review title must be 3 to 100 characters long.'
  }

  if (comment.trim().length < 3 || comment.trim().length > 2000) {
    return 'Review must be 3 to 2000 characters long.'
  }

  if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
    return 'Rating must be between 1 and 5.'
  }
  return null
}


app.post('/api/reviews', async (req, res) => {
  try {

    if (!req.session.userId) {
      return res.status(401).json({ error: 'You must be logged in to post a review.' })
    }


    const users = await readJson(USERS_FILE)
    const user = users.find((u) => u.id === req.session.userId)

    if (!user) {
      return res.status(401).json({ error: 'Invalid session.' })
    }


    const { productSlug, productTitle, title, rating, comment } = req.body

    if (!productSlug || !productTitle || !title || !rating || !comment) {
      return res.status(400).json({ error: 'Missing required review fields.' })
    }

    const reviewError = validateReview({ title, rating, comment })
    if (reviewError) {
      return res.status(400).json({ error: reviewError })
    }

    const reviews = await readJson(REVIEWS_FILE)

    const newReview = {
      id: crypto.randomUUID(),
      productSlug,
      productTitle,
      userId: user.id,
      userSlug: user.slug,
      userName: user.username,
      title: title.trim(),
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    }

    reviews.unshift(newReview)
    await writeJson(REVIEWS_FILE, reviews)

    res.status(201).json({ review: newReview })
  } catch (error) {
    console.error('Review error:', error)
    res.status(500).json({ error: 'Server error while posting review.' })
  }
})

app.get('/api/reviews/by-product/:productSlug', async (req, res) => {
  try {
    const { productSlug } = req.params
    const reviews = await readJson(REVIEWS_FILE)

    const productReviews = reviews.filter((review) => review.productSlug === productSlug)

    res.json({ reviews: productReviews })
  } catch (error) {
    console.error('Product reviews error:', error)
    res.status(500).json({ error: 'Server error while loading product reviews.' })
  }
})

app.get('/api/reviews/by-user/:slug', async (req, res) => {
  try {
    const { slug } = req.params
    const reviews = await readJson(REVIEWS_FILE)

    const userReviews = reviews.filter((review) => review.userSlug === slug)

    res.json({ reviews: userReviews })
  } catch (error) {
    console.error('User reviews error:', error)
    res.status(500).json({ error: 'Server error while loading user reviews.' })
  }
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

export default app
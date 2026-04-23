import express from 'express'
import cors from 'cors'
import argon2 from 'argon2'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001

const DATA_DIR = path.join(__dirname, 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json')

app.use(
  cors({
    origin: 'http://localhost:5173',
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

app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' })
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

    res.status(201).json({
      user: getSafeUser(newUser)
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

    res.json({
      user: getSafeUser(matchedUser)
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Server error during login.' })
  }
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

app.post('/api/reviews', async (req, res) => {
  try {
    const { productSlug, productTitle, title, rating, comment, userId, userSlug, userName } = req.body

    if (!productSlug || !productTitle || !title || !rating || !comment || !userId || !userSlug || !userName) {
      return res.status(400).json({ error: 'Missing required review fields.' })
    }

    const reviews = await readJson(REVIEWS_FILE)

    const newReview = {
      id: crypto.randomUUID(),
      productSlug,
      productTitle,
      userId,
      userSlug,
      userName,
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})
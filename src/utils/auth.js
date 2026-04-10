const USERS_KEY = 'shop_users'
const CURRENT_USER_KEY = 'shop_current_user'

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function makeUniqueSlug(baseSlug, users) {
  let slug = baseSlug || 'user'
  let count = 1

  while (users.some((user) => user.slug === slug)) {
    slug = `${baseSlug || 'user'}-${count}`
    count += 1
  }

  return slug
}

export function registerUser({ username, email, password, slug }) {
  const users = getUsers()

  const existingUser = users.find(
    (user) =>
      user.email.toLowerCase() === email.toLowerCase() ||
      user.username.toLowerCase() === username.toLowerCase()
  )

  if (existingUser) {
    throw new Error('User with that email or username already exists.')
  }

  const baseSlug = slugify(slug || username)
  const uniqueSlug = makeUniqueSlug(baseSlug, users)

  const newUser = {
    id: crypto.randomUUID(),
    username: username.trim(),
    slug: uniqueSlug,
    email: email.trim(),
    password
  }

  users.push(newUser)
  saveUsers(users)

  const safeUser = {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    slug: newUser.slug
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser))
  return safeUser
}

export function loginUser({ email, password }) {
  const users = getUsers()

  const matchedUser = users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password
  )

  if (!matchedUser) {
    throw new Error('Invalid email or password.')
  }

  const safeUser = {
    id: matchedUser.id,
    username: matchedUser.username,
    email: matchedUser.email,
    slug: matchedUser.slug
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser))
  return safeUser
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY)
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null')
}

export function getAllUsers() {
  return getUsers().map((user) => ({
    id: user.id,
    username: user.username,
    slug: user.slug,
    email: user.email
  }))
}
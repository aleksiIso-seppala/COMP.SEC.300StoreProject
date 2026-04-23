const API_BASE = 'http://localhost:3001/api'
const CURRENT_USER_KEY = 'shop_current_user'

export async function registerUser({ username, email, password }) {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      email,
      password
    })
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Registration failed.')
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user))
  return data.user
}

export async function loginUser({ email, password }) {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Login failed.')
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user))
  return data.user
}


export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY)
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null')
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'

export async function postReview({
  productSlug,
  productTitle,
  title,
  rating,
  comment,
}) {
  const response = await fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      productSlug,
      productTitle,
      title,
      rating,
      comment,
    })
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to post review.')
  }

  return data.review
}

export async function getReviewsByProduct(productSlug) {
  const response = await fetch(`${API_BASE}/reviews/by-product/${productSlug}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to load product reviews.')
  }

  return data.reviews
}

export async function getProfile(slug) {
  const response = await fetch(`${API_BASE}/profile/${slug}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to load profile.')
  }

  return data
}

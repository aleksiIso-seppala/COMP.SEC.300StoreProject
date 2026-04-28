<template>
  <section v-if="item" class="item-page" aria-label="Item details">
    <RouterLink class="back-link" to="/">← Back to products</RouterLink>

    <div class="item-layout">
      <div class="item-image-wrap">
        <img :src="item.image" :alt="item.title" class="item-image" />
      </div>

      <div class="item-details">
        <h2>{{ item.title }}</h2>
        <p class="item-description">{{ item.longDescription }}</p>
      </div>
    </div>

    <section class="reviews-section">
      <div class="reviews-header">
        <h3>User reviews</h3>
        <p>Share your thoughts about this game below.</p>
      </div>

      <div v-if="reviews.length" class="review-list">
        <article v-for="review in reviews" :key="review.id" class="review-card">
          <div class="review-header">
            <h4 class="review-title">{{ review.title }}</h4>

            <div class="review-meta">
              <RouterLink
                v-if="review.userSlug"
                :to="`/profile/${review.userSlug}`"
                class="review-name-link"
              >
                {{ review.userName || review.name }}
              </RouterLink>
              <strong v-else class="review-name">
                {{ review.userName || review.name }}
              </strong>
              <span class="review-stars">{{ '★'.repeat(review.rating) }}</span>
            </div>
          </div>

          <p class="review-comment">{{ review.comment }}</p>
        </article>
      </div>

      <p v-else class="empty-state">No reviews yet. Be the first to leave one.</p>

      <form v-if="currentUser" class="review-form" @submit.prevent="submitReview">
        <h4>Leave a review</h4>

        <div class="form-grid">
          <label>
            Review title
            <input v-model="reviewTitle" type="text" placeholder="Review title" required />
          </label>

          <label>
            Rating
            <select v-model.number="reviewRating" required>
              <option :value="5">5 stars</option>
              <option :value="4">4 stars</option>
              <option :value="3">3 stars</option>
              <option :value="2">2 stars</option>
              <option :value="1">1 star</option>
            </select>
          </label>
        </div>

        <label>
          Review
          <textarea
            v-model="reviewComment"
            rows="5"
            placeholder="Write your review here..."
            required
          />
        </label>

        <button class="btn btn-primary" type="submit">Post Review</button>
      </form>

      <p v-else class="login-prompt">Please log in to leave a review.</p>
    </section>
  </section>

  <section v-else class="item-page">
    <RouterLink class="back-link" to="/">← Back to products</RouterLink>
    <section class="reviews-section">
      <div class="reviews-header">
        <h3>Item not found</h3>
        <p>That product does not exist or may have been removed.</p>
      </div>
    </section>
  </section>
</template>

<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { products } from '../data/products'
import { getCurrentUser } from '../utils/auth'
import { postReview } from '../utils/reviews'

const route = useRoute()
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'

const item = computed(() => products.find((entry) => entry.slug === route.params.slug) || null)
const currentUser = ref(null)
const reviews = ref([])
const reviewTitle = ref('')
const reviewRating = ref(5)
const reviewComment = ref('')

onMounted(async () => {
  currentUser.value = await getCurrentUser()
})


const loadReviews = async () => {
  if (!item.value) {
    reviews.value = []
    return
  }

  try {
    const response = await fetch(
      `${API_BASE}/reviews/by-product/${encodeURIComponent(item.value.slug)}`
    )
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load reviews.')
    }

    reviews.value = data.reviews || []
    console.log('loaded reviews for', item.value.slug, reviews.value)
  } catch (error) {
    console.error('Failed to load reviews:', error)
    reviews.value = []
  }
}

const submitReview = async () => {
  if (!item.value || !currentUser.value || !reviewTitle.value.trim() || !reviewComment.value.trim()) {
    return
  }

  try {
    const newReview = await postReview({
      productSlug: item.value.slug,
      productTitle: item.value.title,
      title: reviewTitle.value.trim(),
      rating: reviewRating.value,
      comment: reviewComment.value.trim(),
    })

    reviews.value.unshift(newReview)

    reviewTitle.value = ''
    reviewRating.value = 5
    reviewComment.value = ''
  } catch (error) {
    console.error('Failed to post review:', error)
    alert(error.message)
  }
}

watch(() => route.params.slug, loadReviews, { immediate: true })
</script>

<style scoped>
.item-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.back-link {
  width: fit-content;
  color: #2563eb;
  font-weight: 700;
  text-decoration: none;
}

.item-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 32px;
  align-items: stretch;
}

.item-image-wrap,
.item-details,
.reviews-section,
.review-card,
.not-found {
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 28px;
  background: #182535;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
}

.item-image-wrap {
  overflow: hidden;
  min-height: 360px;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: fill;
}

.item-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  padding: 32px;
}

.item-badge {
  width: fit-content;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
  font-size: 0.9rem;
  font-weight: 700;
}

.item-details h2 {
  margin: 0;
  font-size: clamp(2rem, 3vw, 2.6rem);
}

.item-description {
  margin: 0;
  color: #76859b;
  line-height: 1.7;
}

.item-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.item-price {
  font-size: 2rem;
  font-weight: 800;
}

.reviews-section {
  padding: 28px;
}

.reviews-header h3,
.review-form h4 {
  margin: 0 0 8px;
}

.reviews-header p,
.empty-state,
.login-prompt {
  margin: 0;
  color: #6b7280;
}

.review-list {
  display: grid;
  gap: 16px;
  margin: 24px 0;
}

.review-card {
  padding: 18px 20px;
}

.review-topline {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.review-card p {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
}

.review-form {
  display: grid;
  gap: 16px;
  margin-top: 28px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 10px;
}

.review-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.review-name {
  font-weight: 700;
  color: #dee1e6;
}

.review-name-link {
  font-weight: 700;
  color: #dee1e6;
  text-decoration: none;
}

.review-name-link:hover {
  text-decoration: underline;
}

.review-stars {
  font-size: 0.95rem;
  font-weight: 700;
  color: #f59e0b;
}

.review-comment {
  margin: 0;
  color: #dee1e6;
  line-height: 1.6;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

label {
  display: grid;
  gap: 8px;
  font-weight: 600;
}

input,
select,
textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(148, 163, 184, 0.45);
  border-radius: 14px;
  background: #283645;
  color: #d9e0e3;
}

.btn {
  padding: 12px 18px;
  border-radius: 14px;
  border: 1px solid transparent;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background: #157bc4;
  color: #d9e0e3;
  box-shadow: 0 6px 12px rgba(37, 99, 235, 0.25);
}

@media (max-width: 900px) {
  .item-layout,
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

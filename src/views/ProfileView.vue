<template>
  <section class="profile-page">
    <div v-if="profileUser" class="profile-card">
      <div class="profile-header">
        <h2>{{ profileUser.username }}</h2>
        <p>{{ userReviews.length }} review<span v-if="userReviews.length !== 1">s</span> posted</p>
      </div>

      <div v-if="userReviews.length" class="profile-review-list">
        <article v-for="review in userReviews" :key="review.id" class="profile-review-card">
          
          <RouterLink :to="`/item/${review.productSlug}`" class="profile-product-link">
            Reviewed {{ review.productTitle }}
          </RouterLink>
          
          <div class="profile-review-header">
            <h2 class="profile-review-title">{{ review.title }}</h2>
            <span class="profile-review-stars">{{ '★'.repeat(review.rating) }}</span>
          </div>

          <p class="profile-review-comment">{{ review.comment }}</p>
        </article>
      </div>

      <p v-else class="empty-profile">
        This user has not posted any reviews yet.
      </p>
    </div>

    <div v-else class="profile-card">
      <h2>Profile not found</h2>
      <p>That public profile does not exist.</p>
      <RouterLink to="/" class="btn btn-primary">Back to shop</RouterLink>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { products } from '../data/products'
import { getAllUsers } from '../utils/auth'

const route = useRoute()

const users = getAllUsers()

const profileUser = computed(() => users.find((user) => user.slug === route.params.slug) || null)

const userReviews = computed(() => {
  if (!profileUser.value) return []

  return products.flatMap((product) =>
    product.reviews
      .filter((review) => review.userSlug === profileUser.value.slug)
      .map((review) => ({
        ...review,
        productTitle: product.title,
        productSlug: product.slug
      }))
  )
})
</script>

<style scoped>
.profile-page {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.profile-card {
  width: 100%;
  max-width: 860px;
  padding: 32px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 10px;
  background: #182535;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
}

.profile-header {
  margin-bottom: 24px;
}

.profile-badge {
  display: inline-block;
  margin-bottom: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
  font-size: 0.9rem;
  font-weight: 700;
}

.profile-header h2 {
  margin: 0 0 8px;
}

.profile-header p,
.empty-profile {
  margin: 0;
  color: #6b7280;
}

.profile-review-list {
  display: grid;
  gap: 16px;
}

.profile-review-card {
  padding: 20px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  background: #243c59;
}

.profile-review-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 10px;
}

.profile-review-title h2 {
  margin: 0;
  font-size: 1.05rem;
}

.profile-review-stars {
  color: #f59e0b;
  font-weight: 700;
  flex-shrink: 0;
}

.profile-product-link {
  display: inline-block;
  margin-bottom: 12px;
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.profile-product-link:hover {
  text-decoration: underline;
}

.profile-review-comment {
  margin: 0;
  color: #d9e0e3;
  line-height: 1.6;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 18px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
}

@media (max-width: 640px) {
  .profile-card {
    padding: 22px;
  }

  .profile-review-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
<template>
  <RouterLink :to="`/item/${product.slug}`" class="card-item">
    <img :src="product.image" :alt="product.title" class="card-preview" />

    <div class="card-body">
      <div>
        <h2>{{ product.title }}</h2>
        <p>{{ product.description }}</p>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  product: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.card-item {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 10px;
  border-radius: 8px;
  background: linear-gradient(135deg, #2681a8, #1a567a);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.12);
}

.card-preview {
  width: 100%;
  aspect-ratio: 375 / 177;
  object-fit: cover;
  display: block;
}

.card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
}

.card-body h2 {
  margin: 0 0 8px;
  font-size: 2rem;
}

.card-body p {
  margin: 0;
  color: linear-gradient(135deg, #237ca4, #1a567a);
  line-height: 1.5;
}

.price {
  font-size: 1.2rem;
}
</style>
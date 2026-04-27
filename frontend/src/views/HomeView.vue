<template>
  <div>
    <section class="hero">
      <h2>New and trending games</h2>
    </section>

    <section class="cards-section" aria-label="Featured items">
      <ProductCard
        v-for="item in products"
        :key="item.id"
        :product="item"
      />
    </section>
  </div>
</template>

<script setup>
import ProductCard from '../components/ProductCard.vue'
import { products } from '../data/products'
</script>

<style scoped>
.hero {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 28px;
}

.eyebrow {
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  font-size: 0.9rem;
  font-weight: 700;
}

.hero h2 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
}

.hero p {
  margin: 0;
  max-width: 720px;
  color: #4b5563;
  font-size: 1.05rem;
}

.cards-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}
</style>
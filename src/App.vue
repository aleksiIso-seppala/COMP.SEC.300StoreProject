<template>
  <div class="page-shell">
    <header class="topbar-shell">
      <div class="topbar">
        <div class="brand-block">
          <RouterLink to="/" class="brand-link">
            <h1 class="brand">DefinitelyNotSteam</h1>
          </RouterLink>
        </div>

        <nav class="auth-actions" aria-label="Authentication actions">
          <template v-if="currentUser">
            <span class="brand">{{ currentUser.username }}</span>
            <RouterLink :to="'/profile/' + currentUser.slug" class="btn btn-primary">Profile</RouterLink>
            <RouterLink to="/account" class="btn btn-primary">Account</RouterLink>
            <button class="btn btn-primary" @click="handleLogout">Logout</button>
          </template>

          <template v-else>
            <button class="btn btn-ghost" @click="openModal('login')">Login</button>
            <button class="btn btn-primary" @click="openModal('register')">Register</button>
          </template>
        </nav>
      </div>
    </header>

    <main class="content">
      <RouterView />
    </main>

    <AuthModal
      :isOpen="isAuthModalOpen"
      :mode="authMode"
      @close="isAuthModalOpen = false"
      @switch-mode="toggleAuthMode"
      @submit="handleAuthSubmit"
    />

  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
import AuthModal from './components/AuthModal.vue'
import { ref } from 'vue'
import { getCurrentUser, loginUser, registerUser, logoutUser } from './utils/auth'

const isAuthModalOpen = ref(false)
const authMode = ref('login')
const currentUser = ref(getCurrentUser())

const openModal = (mode) => {
  authMode.value = mode
  isAuthModalOpen.value = true
}

const toggleAuthMode = () => {
  authMode.value = authMode.value === 'login' ? 'register' : 'login'
}

const handleAuthSubmit = ({ username, email, password, setError, close }) => {
  try {
    if (authMode.value === 'login') {
      currentUser.value = loginUser({ email, password })
    } else {
      currentUser.value = registerUser({ username, email, password })
    }

    close()
    isAuthModalOpen.value = false
  } catch (error) {
    setError(error.message)
  }
}

const handleLogout = () => {
  logoutUser()
  currentUser.value = null
}

</script>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'FS Jack Medium', 'Franklin Gothic Medium', sans-serif;
  background: #f5f7fb;
  color: #d9e0e3;
}

#app {
  min-height: 100vh;
}

img {
  display: block;
  max-width: 100%;
}

button,
input,
select,
textarea {
  font: inherit;
}

.page-shell {
  min-height: 100vh;
  background: linear-gradient(180deg, #2b4c74 0%, #1b2838 100%);
}

.topbar-shell {
  background: #182535;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 32px;
}

.user-name {
  font-weight: 700;
  color: #374151;
}

.brand-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.brand-link {
  text-decoration: none;
  color: inherit;
}

.brand {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
}

.tagline {
  margin: 0;
  color: #ffffff;
}

.auth-actions {
  display: flex;
  gap: 12px;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
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
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  text-decoration: none;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, #237ca4, #1a567a);
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.25);
}

.btn-ghost {
  background: rgba(255, 255, 255, 0.75);
  border-color: rgba(148, 163, 184, 0.35);
  color: #1f2937;
}

.auth-actions {
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .topbar {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
  }

  .content {
    padding: 20px;
  }
}
</style>
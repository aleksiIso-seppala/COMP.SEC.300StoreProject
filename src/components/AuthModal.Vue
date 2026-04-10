<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-card" @click.stop>
      <button class="close-button" @click="closeModal" aria-label="Close modal">×</button>

      <div class="modal-header">
        <h2>{{ isLogin ? 'Login' : 'Register' }}</h2>
        <p>
          {{
            isLogin
              ? 'Welcome back. Sign in to your account.'
              : 'Create an account to start shopping.'
          }}
        </p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <label v-if="!isLogin">
          Username
          <input v-model="form.username" type="text" placeholder="Enter your username" required />
        </label>

        <label>
          Email
          <input v-model="form.email" type="email" placeholder="Enter your email" required />
        </label>

        <label>
          Password
          <input
            v-model="form.password"
            type="password"
            placeholder="Enter your password"
            required
          />
        </label>

        <label v-if="!isLogin">
          Confirm Password
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm your password"
            required
          />
        </label>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <button class="btn btn-primary submit-btn" type="submit">
          {{ isLogin ? 'Login' : 'Register' }}
        </button>
      </form>

      <div class="switch-mode">
        <span>{{ isLogin ? "Don't have an account?" : 'Already have an account?' }}</span>
        <button type="button" class="switch-button" @click="toggleMode">
          {{ isLogin ? 'Register' : 'Login' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, reactive, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  mode: {
    type: String,
    default: 'login'
  }
})

const emit = defineEmits(['close', 'switch-mode', 'submit'])

const errorMessage = ref('')

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const isLogin = computed(() => props.mode === 'login')

const resetForm = () => {
  form.username = ''
  form.email = ''
  form.password = ''
  form.confirmPassword = ''
}

const closeModal = () => {
  emit('close')
}

const toggleMode = () => {
  emit('switch-mode')
  resetForm()
}

const handleSubmit = () => {
  errorMessage.value = ''

  if (!isLogin.value) {
    if (form.password !== form.confirmPassword) {
      errorMessage.value = 'Passwords do not match.'
      return
    }
  }

  emit('submit', {
    username: form.username,
    email: form.email,
    password: form.password,
    slug: form.username.toLowerCase().replace(/\s+/g, '-'),
    setError: (message) => {
      errorMessage.value = message
    },
    close: closeModal
  })
}

watch(
  () => props.isOpen,
  (open) => {
    if (!open) resetForm()
  }
)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
}

.modal-card {
  position: relative;
  width: 100%;
  max-width: 460px;
  padding: 32px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 10px;
  background: linear-gradient(130deg,#29476e,#1b293a);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.2);
}

.close-button {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: #157bc4;
  font-size: 1.4rem;
  cursor: pointer;
}

.modal-header {
  margin-bottom: 24px;
}

.modal-header h2 {
  margin: 0 0 8px;
}

.modal-header p {
  margin: 0;
  color: #6b7280;
}

.auth-form {
  display: grid;
  gap: 16px;
}

label {
  display: grid;
  gap: 8px;
  font-weight: 600;
}

input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(148, 163, 184, 0.45);
  border-radius: 6px;
  background: #d9e0e3;
}

.submit-btn {
  margin-top: 8px;
}

.switch-mode {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  color: #4b5563;
}

.switch-button {
  border: none;
  background: transparent;
  color: #157bc4;
  font-weight: 700;
  cursor: pointer;
}

.btn {
  padding: 12px 18px;
  border-radius: 6px;
  border: 1px solid transparent;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #d9e0e3;
}
</style>
<template>
  <section class="account-page">
    <div v-if="currentUser" class="account-card">
      <div class="account-header">
        <h2>Welcome, {{ currentUser.username }}</h2>
        <p>Manage your account details here.</p>
      </div>

      <div class="account-details">
        <div class="detail-row">
          <span class="detail-label">Username</span>
          <span class="detail-value">{{ currentUser.username }}</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Email</span>
          <span class="detail-value">{{ currentUser.email }}</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">User ID</span>
          <span class="detail-value">{{ currentUser.id }}</span>
        </div>
      </div>

      <div class="account-actions">
        <button class="btn btn-primary" @click="handleLogout">Logout</button>
      </div>
    </div>

    <div v-else class="account-card empty-account">
      <h2>You are not logged in</h2>
      <p>Please log in or register to view your account page.</p>
      <RouterLink to="/" class="btn btn-primary">Back to shop</RouterLink>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { getCurrentUser, logoutUser } from '../utils/auth'

const router = useRouter()
const currentUser = ref(getCurrentUser())

const handleLogout = () => {
  logoutUser()
  currentUser.value = null
  router.push('/')
}
</script>

<style scoped>
.account-page {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.account-card {
  width: 100%;
  max-width: 760px;
  padding: 32px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 10px;
  background: #182535;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
}

.account-header {
  margin-bottom: 28px;
}

.account-badge {
  display: inline-block;
  margin-bottom: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
  font-size: 0.9rem;
  font-weight: 700;
}

.account-header h2 {
  margin: 0 0 8px;
}

.account-header p {
  margin: 0;
  color: #6b7280;
}

.account-details {
  display: grid;
  gap: 14px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  background: #182535;
}

.detail-label {
  font-weight: 700;
  color: #374151;
}

.detail-value {
  color: #111827;
  text-align: right;
  word-break: break-word;
}

.account-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.empty-account {
  text-align: center;
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
  .account-card {
    padding: 22px;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-value {
    text-align: left;
  }

  .account-actions {
    justify-content: stretch;
  }

  .account-actions .btn {
    width: 100%;
  }
}
</style>
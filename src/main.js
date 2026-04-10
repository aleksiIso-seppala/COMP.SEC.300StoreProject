import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import ItemView from './views/ItemView.vue'
import AccountView from './views/AccountView.vue'
import ProfileView from './views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/item/:slug',
      name: 'item',
      component: ItemView
    },
    {
      path: '/account',
      name: 'account',
      component: AccountView
    },
    {
      path: '/profile/:slug',
      name: 'profile',
      component: ProfileView
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

createApp(App).use(router).mount('#app')
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NosotrosView from '@/views/NosotrosView.vue'
import ProductsView from '@/views/ProductsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/nosotros',
      name: 'Sobre Nosotros',
      component: NosotrosView,
    },
    {
      path: '/productos',
      name: 'Sobre Nosotros',
      component: ProductsView,
    },
  ],
})

export default router

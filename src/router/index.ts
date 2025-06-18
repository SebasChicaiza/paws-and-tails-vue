import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NosotrosView from '@/views/NosotrosView.vue'
import ProductsView from '@/views/ProductsView.vue'
import CarritoView from '@/views/CarritoView.vue'
import LoginView from '@/views/LoginView.vue'
import RegistroView from '@/views/RegistroView.vue'
import MiCuentaView from '@/views/MiCuentaView.vue'

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
      name: 'Productos',
      component: ProductsView,
    },
    {
      path: '/carrito',
      name: 'Carrito',
      component: CarritoView,
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
    },
    {
      path: '/registro',
      name: 'Registro',
      component: RegistroView,
    },
    {
      path: '/micuenta',
      name: 'Mi Cuenta',
      component: MiCuentaView,
    },
  ],
})

export default router

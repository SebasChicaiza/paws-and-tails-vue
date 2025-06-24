import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const userRole = ref('')
  const userName = ref('')
  const isAuthenticated = ref(false)

  function login(userNameParam: string) {
    isAuthenticated.value = true
    userName.value = userNameParam
    const cuenta = JSON.parse(localStorage.getItem('cuenta') || '{}')
    userRole.value = cuenta.Rol || 'user'
    console.log('Usuario autenticado:', userNameParam, 'Rol:', userRole.value)
    localStorage.setItem('usuario', userNameParam)
  }

  function logout() {
    isAuthenticated.value = false
    userName.value = ''
    userRole.value = ''
    localStorage.removeItem('usuario')
    localStorage.removeItem('cuenta')
    alert('Sesión cerrada correctamente.')
  }

  function checkAuth() {
    const user = localStorage.getItem('usuario')
    isAuthenticated.value = !!user
    userName.value = user || ''
  }

  function loadFromLocalStorage() {
    const cuenta = JSON.parse(localStorage.getItem('cuenta') || '{}')
    userRole.value = cuenta.Rol || ''
    userName.value = cuenta.Nombre || ''
    isAuthenticated.value = !!cuenta.Rol
  }

  return { userRole, userName, isAuthenticated, login, logout, checkAuth, loadFromLocalStorage }
})

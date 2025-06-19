import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    isAuthenticated: false,
    userName: '',
  }),
  actions: {
    login(userName: string) {
      this.isAuthenticated = true
      this.userName = userName
      localStorage.setItem('usuario', userName)
    },
    logout() {
      this.isAuthenticated = false
      this.userName = ''
      localStorage.removeItem('usuario')
      localStorage.removeItem('cuenta')
      alert('Sesión cerrada correctamente.')
    },
    checkAuth() {
      const user = localStorage.getItem('usuario')
      this.isAuthenticated = !!user
      this.userName = user || ''
    },
    loadFromLocalStorage() {
      const user = localStorage.getItem('usuario')
      this.isAuthenticated = !!user
      this.userName = user || ''
    },
  },
})

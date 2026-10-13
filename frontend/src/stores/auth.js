import { create } from 'zustand'
import api from '../services/api.js'

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),

  isAuthenticated: () => !!get().token,
  isAdmin: () => get().user?.role === 'admin',
  isCashier: () => get().user?.role === 'user' || get().user?.role === 'cashier',

  setAuth: (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ token, user })
  },

  clearAuth: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ token: null, user: null })
  },

  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    get().setAuth(data.token, data.user)
    return data
  },

  login: async (payload) => {
    const { data } = await api.post('/auth/login', payload)
    get().setAuth(data.token, data.user)
    return data
  },

  logout: async () => {
    try { await api.post('/auth/logout') } catch (_) {}
    get().clearAuth()
  },

  updateProfile: async (payload) => {
    const { data } = await api.put('/auth/profile', payload)
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user })
    }
    return data
  },

  updatePassword: async (payload) => {
    const { data } = await api.put('/auth/password', payload)
    return data
  }
}))

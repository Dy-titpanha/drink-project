import api from './api.js'

export function getDashboardStats() {
  return api.get('/dashboard/stats')
}

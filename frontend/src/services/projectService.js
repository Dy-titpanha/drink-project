import api from './api.js'

export function getProjects(status = null) {
  const params = status ? { status } : {}
  return api.get('/projects', { params })
}

export function createProject(payload) {
  return api.post('/projects', payload)
}

export function updateProject(id, payload) {
  return api.put(`/projects/${id}`, payload)
}

export function deleteProject(id) {
  return api.delete(`/projects/${id}`)
}

export function updateProjectStatus(id, status) {
  return api.post(`/projects/${id}/status`, { status })
}

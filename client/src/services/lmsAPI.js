import axios from 'axios'

const API_URL = 'http://localhost:5000/api/lms'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lms_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth APIs
export const lmsAuthAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (data) => api.post('/auth/google-login', data),
  getProfile: () => api.get('/auth/me')
}

// Class APIs
export const lmsClassAPI = {
  create: (data) => api.post('/classes', data),
  getAll: () => api.get('/classes'),
  getOne: (id) => api.get(`/classes/${id}`),
  join: (joinCode) => api.post('/classes/join', { joinCode }),
  leave: (id) => api.post(`/classes/${id}/leave`),
  rename: (id, className) => api.put(`/classes/${id}/rename`, { className }),
  removeStudent: (classId, studentId) => api.delete(`/classes/${classId}/students/${studentId}`),
  resetCode: (id) => api.put(`/classes/${id}/reset-code`),
  export: (id) => api.get(`/classes/${id}/export`),
  delete: (id) => api.delete(`/classes/${id}`)
}

// Assignment APIs
export const lmsAssignmentAPI = {
  create: (data) => api.post('/assignments', data),
  getByClass: (classId) => api.get(`/assignments/class/${classId}`),
  getOne: (id) => api.get(`/assignments/${id}`),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`)
}

// Submission APIs
export const lmsSubmissionAPI = {
  submit: (data) => api.post('/submissions', data),
  getByAssignment: (assignmentId) => api.get(`/submissions/assignment/${assignmentId}`),
  getMy: () => api.get('/submissions/my-submissions'),
  getOne: (id) => api.get(`/submissions/${id}`),
  grade: (id, data) => api.put(`/submissions/${id}/grade`, data),
  filterByStatus: (assignmentId, status) => api.get(`/submissions/assignment/${assignmentId}/filter/${status}`)
}

export default api

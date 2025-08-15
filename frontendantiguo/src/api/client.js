import axios from 'axios'
import { urlApi } from './api'

const api = axios.create({
  baseURL: `${urlApi}/api`,
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err?.response?.data?.error || err?.response?.data?.mensaje || err.message || 'Error de red'
    return Promise.reject(new Error(msg))
  }
)

export default api

import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

// Attach the login token to every request automatically.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// If the server says "401 not logged in" on a normal request, sign the user out.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url: string = error.config?.url ?? ''
    if (error.response?.status === 401 && !url.startsWith('/auth/')) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  },
)

/** Turn any axios error into a short message a human can read. */
export function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg // validation errors
    if (!err.response) return 'Cannot reach the server. Is the backend running?'
  }
  return 'Something went wrong. Please try again.'
}

export default api

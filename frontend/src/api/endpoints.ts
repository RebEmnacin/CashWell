import api from './client'
import type {
  AuthResponse, Budget, Category, CategoryTotal, MonthlyPoint, Summary,
  Transaction, TransactionFilters, TransactionInput,
} from '../types'

/** Remove empty filter values so they are not sent as ?search= etc. */
function clean(params: object) {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined))
}

export const authApi = {
  login: (email: string, password: string) => {
    const form = new URLSearchParams() // OAuth2 login expects form data, not JSON
    form.set('username', email)
    form.set('password', password)
    return api.post<AuthResponse>('/auth/login', form).then((r) => r.data)
  },
  register: (name: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { name, email, password }).then((r) => r.data),
  demo: () => api.post<AuthResponse>('/auth/demo').then((r) => r.data),
}

export const categoryApi = {
  list: () => api.get<Category[]>('/categories').then((r) => r.data),
}

export const transactionApi = {
  list: (filters: TransactionFilters = {}) =>
    api
      .get<{ items: Transaction[]; total: number }>('/transactions', { params: clean(filters) })
      .then((r) => r.data),
  create: (data: TransactionInput) => api.post<Transaction>('/transactions', data).then((r) => r.data),
  update: (id: number, data: TransactionInput) =>
    api.put<Transaction>(`/transactions/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/transactions/${id}`),
  exportCsv: async (filters: TransactionFilters = {}) => {
    const { page, limit, ...rest } = filters
    void page; void limit
    const res = await api.get('/transactions/export', { params: clean(rest), responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transactions.csv'
    a.click()
    URL.revokeObjectURL(url)
  },
}

export const analyticsApi = {
  summary: (month: string) => api.get<Summary>('/analytics/summary', { params: { month } }).then((r) => r.data),
  byCategory: (month: string) =>
    api.get<CategoryTotal[]>('/analytics/by-category', { params: { month } }).then((r) => r.data),
  monthly: (months = 6) => api.get<MonthlyPoint[]>('/analytics/monthly', { params: { months } }).then((r) => r.data),
}

export const budgetApi = {
  list: (month: string) => api.get<Budget[]>('/budgets', { params: { month } }).then((r) => r.data),
  set: (categoryId: number, amount: number) => api.put(`/budgets/${categoryId}`, { amount }),
  remove: (categoryId: number) => api.delete(`/budgets/${categoryId}`),
}

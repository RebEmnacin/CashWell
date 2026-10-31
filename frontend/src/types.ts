export type TxType = 'income' | 'expense'

export interface User {
  id: number
  name: string
  email: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface Category {
  id: number
  name: string
  type: TxType
  color: string
}

export interface Transaction {
  id: number
  category_id: number
  type: TxType
  amount: number
  description: string
  date: string // YYYY-MM-DD
  category: Category
}

export interface TransactionInput {
  category_id: number
  amount: number
  description: string
  date: string
}

export interface TransactionFilters {
  type?: TxType | ''
  category_id?: number | ''
  start?: string
  end?: string
  search?: string
  page?: number
  limit?: number
}

export interface Summary {
  month: string
  income: number
  expense: number
  balance: number
  savings_rate: number
  prev_income: number
  prev_expense: number
  transaction_count: number
}

export interface CategoryTotal {
  category_id: number
  name: string
  color: string
  total: number
}

export interface MonthlyPoint {
  month: string
  label: string
  income: number
  expense: number
}

export interface Budget {
  category_id: number
  category_name: string
  color: string
  limit: number
  spent: number
  percent: number
}

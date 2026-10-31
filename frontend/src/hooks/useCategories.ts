import { useEffect, useState } from 'react'
import { categoryApi } from '../api/endpoints'
import type { Category } from '../types'

/** Loads the user's categories once. */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  useEffect(() => {
    categoryApi.list().then(setCategories).catch(() => setCategories([]))
  }, [])
  return categories
}

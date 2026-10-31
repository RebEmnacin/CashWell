import { ChevronLeft, ChevronRight, Download, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { errorMessage } from '../api/client'
import { transactionApi } from '../api/endpoints'
import PageHeader from '../components/PageHeader'
import TransactionModal from '../components/TransactionModal'
import { useCategories } from '../hooks/useCategories'
import { money, prettyDate } from '../lib/format'
import type { Transaction, TransactionFilters } from '../types'

const PAGE_SIZE = 10

export default function Transactions() {
  const categories = useCategories()
  const [items, setItems] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [type, setType] = useState<TransactionFilters['type']>('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)

  // Wait 350ms after typing stops before searching (so we don't call the API on every keystroke)
  useEffect(() => {
    const id = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 350)
    return () => clearTimeout(id)
  }, [search])

  const filters: TransactionFilters = { type, category_id: categoryId, start, end, search: debouncedSearch }

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await transactionApi.list({ ...filters, page, limit: PAGE_SIZE })
      setItems(res.items)
      setTotal(res.total)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, categoryId, start, end, debouncedSearch, page])

  useEffect(() => { load() }, [load])

  const changeFilter = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setPage(1) }

  const remove = async (t: Transaction) => {
    if (!window.confirm(`Delete "${t.description || t.category.name}"?`)) return
    try {
      await transactionApi.remove(t.id)
      // If we deleted the last item on this page, step back one page
      if (items.length === 1 && page > 1) setPage(page - 1)
      else load()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const openNew = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (t: Transaction) => { setEditing(t); setModalOpen(true) }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const clearFilters = () => {
    setSearch(''); setDebouncedSearch(''); setType(''); setCategoryId(''); setStart(''); setEnd(''); setPage(1)
  }
  const hasFilters = search || type || categoryId || start || end

  return (
    <>
      <PageHeader title="Transactions" subtitle={`${total} total`}>
        <button className="btn-ghost" onClick={() => transactionApi.exportCsv(filters).catch((e) => setError(errorMessage(e)))}>
          <Download className="size-4" /> Export CSV
        </button>
        <button className="btn-primary" onClick={openNew}><Plus className="size-4" /> Add</button>
      </PageHeader>

      {/* Filters */}
      <div className="card mb-5 animate-rise">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search notes…" aria-label="Search" value={search}
              onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input" aria-label="Type" value={type}
            onChange={(e) => changeFilter(setType)(e.target.value as TransactionFilters['type'])}>
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select className="input" aria-label="Category" value={categoryId}
            onChange={(e) => changeFilter(setCategoryId)(e.target.value ? Number(e.target.value) : '')}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="date" className="input" aria-label="From date" value={start}
            onChange={(e) => changeFilter(setStart)(e.target.value)} />
          <input type="date" className="input" aria-label="To date" value={end}
            onChange={(e) => changeFilter(setEnd)(e.target.value)} />
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="mt-3 cursor-pointer text-xs font-semibold text-brand-600 hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">{error}</p>}

      <div className="card animate-rise overflow-hidden p-0" style={{ animationDelay: '80ms' }}>
        {loading && items.length === 0 ? (
          <div className="space-y-px">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-16 animate-pulse bg-slate-50" />)}</div>
        ) : items.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-400">
            {hasFilters ? 'No transactions match your filters.' : 'No transactions yet. Add your first one!'}
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="hidden border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500 md:table-header-group">
              <tr>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Note</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 text-right font-semibold">Amount</th>
                <th className="w-24 px-5 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-slate-100 transition-opacity ${loading ? 'opacity-50' : ''}`}>
              {items.map((t) => (
                <tr key={t.id} className="group hover:bg-slate-50/60">
                  <td className="hidden whitespace-nowrap px-5 py-3.5 text-slate-500 md:table-cell">{prettyDate(t.date)}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold">{t.description || '—'}</p>
                    <p className="text-xs text-slate-400 md:hidden">{t.category.name} · {prettyDate(t.date)}</p>
                  </td>
                  <td className="hidden px-5 py-3.5 md:table-cell">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">
                      <span className="size-2 rounded-full" style={{ background: t.category.color }} />{t.category.name}
                    </span>
                  </td>
                  <td className={`whitespace-nowrap px-5 py-3.5 text-right font-extrabold ${t.type === 'income' ? 'text-emerald-600' : ''}`}>
                    {t.type === 'income' ? '+' : '−'}{money(t.amount)}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex justify-end gap-1">
                      <button aria-label="Edit" onClick={() => openEdit(t)}
                        className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Pencil className="size-4" /></button>
                      <button aria-label="Delete" onClick={() => remove(t)}
                        className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {total > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button className="btn-ghost !px-3" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page">
              <ChevronLeft className="size-4" />
            </button>
            <button className="btn-ghost !px-3" disabled={page >= totalPages} onClick={() => setPage(page + 1)} aria-label="Next page">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      <TransactionModal open={modalOpen} editing={editing} categories={categories}
        onClose={() => setModalOpen(false)} onSaved={load} />
    </>
  )
}

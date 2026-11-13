import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { errorMessage } from '../api/client'
import { transactionApi } from '../api/endpoints'
import NoteSearch from '../components/NoteSearch'
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
  const [searchInput, setSearchInput] = useState('') // what is typed in the search box (does not change the table)
  const [search, setSearch] = useState('') // the search the table is actually filtered by (set on Enter / suggestion click)
  const [type, setType] = useState<TransactionFilters['type']>('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)

  const filters: TransactionFilters = { type, category_id: categoryId, start, end, search }

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
  }, [type, categoryId, start, end, search, page])

  useEffect(() => { load() }, [load])

  const changeFilter = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setPage(1) }

  // The Category filter only lists categories of the chosen Type (Income shows Salary, Freelance…; Expense shows Rent, Food…).
  const filterCategories = type ? categories.filter((c) => c.type === type) : categories

  // Changing the Type: if the category that is already picked belongs to the other type, clear it (otherwise nothing would match).
  const changeType = (v: TransactionFilters['type']) => {
    setType(v)
    setPage(1)
    if (v && categoryId !== '' && !categories.some((c) => c.id === categoryId && c.type === v)) setCategoryId('')
  }

  // "From" is the starting date, so "To" can never be earlier than it (dates are YYYY-MM-DD, so plain string compare works).
  // Moving From past To drags To along; typing a To that is too early snaps it back to From.
  const changeStart = (v: string) => {
    setStart(v)
    if (v && end && end < v) setEnd(v)
    setPage(1)
  }
  const changeEnd = (v: string) => {
    setEnd(v && start && v < start ? start : v)
    setPage(1)
  }

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
    setSearchInput(''); setSearch(''); setType(''); setCategoryId(''); setStart(''); setEnd(''); setPage(1)
  }
  const hasFilters = search || type || categoryId || start || end

  return (
    <>
      {/* the title on its own; -mb-3 pulls the filters panel up so there is only a small gap under it */}
      <div className="-mb-3">
        <PageHeader title="Transactions" />
      </div>

      {/* Filters */}
      <div className="card relative z-20 mb-5 animate-rise">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <NoteSearch
              id="f-search"
              label="Search"
              value={searchInput}
              onChange={setSearchInput}
              onSubmit={(v) => { setSearchInput(v); setSearch(v.trim()); setPage(1) }}
              scope={{ type, category_id: categoryId, start, end }}
            />
          </div>
          <div>
            <label htmlFor="f-type" className="label">Type</label>
            <select id="f-type" className="input" value={type}
              onChange={(e) => changeType(e.target.value as TransactionFilters['type'])}>
              <option value="">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label htmlFor="f-category" className="label">Category</label>
            <select id="f-category" className="input" value={categoryId}
              onChange={(e) => changeFilter(setCategoryId)(e.target.value ? Number(e.target.value) : '')}>
              <option value="">All categories</option>
              {filterCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {/* From and To share one cell so a dash can sit between the two date boxes */}
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-2">
            <div className="min-w-0 flex-1">
              <label htmlFor="f-from" className="label">From</label>
              <input id="f-from" type="date" className="input" value={start} onChange={(e) => changeStart(e.target.value)} />
            </div>
            <span aria-hidden className="pb-3 text-slate-400">–</span>
            <div className="min-w-0 flex-1">
              <label htmlFor="f-to" className="label">To</label>
              <input id="f-to" type="date" className="input" value={end} min={start || undefined}
                onChange={(e) => changeEnd(e.target.value)} />
            </div>
          </div>
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="mt-3 cursor-pointer text-xs font-semibold text-brand-600 hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">{error}</p>}

      {/* Row above the table: the total on the left; Export, Add and the page buttons on the right.
          Text and buttons share one small size (text-xs); 10px between "total" and "Page", 8px down to the table. */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-[10px] text-slate-500">
          <span>{total} total</span>
          {total > PAGE_SIZE && <span>Page {page} of {totalPages}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-ghost !px-3 !py-1.5 !text-xs" onClick={() => transactionApi.exportCsv(filters).catch((e) => setError(errorMessage(e)))}>
            <Download className="size-3.5" /> Export CSV
          </button>
          <button className="btn-primary !px-3 !py-1.5 !text-xs" onClick={openNew}><Plus className="size-3.5" /> Add</button>
          {total > PAGE_SIZE && (
            <div className="flex items-center gap-2">
              <span aria-hidden className="mx-1 hidden h-5 w-px bg-slate-200 sm:block" />
              <button className="btn-ghost !px-2.5 !py-1.5" disabled={page <= 1} onClick={() => setPage(1)} aria-label="First page" title="First page">
                <ChevronsLeft className="size-3.5" />
              </button>
              <button className="btn-ghost !px-2.5 !py-1.5" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page" title="Previous page">
                <ChevronLeft className="size-3.5" />
              </button>
              <button className="btn-ghost !px-2.5 !py-1.5" disabled={page >= totalPages} onClick={() => setPage(page + 1)} aria-label="Next page" title="Next page">
                <ChevronRight className="size-3.5" />
              </button>
              <button className="btn-ghost !px-2.5 !py-1.5" disabled={page >= totalPages} onClick={() => setPage(totalPages)} aria-label="Last page" title="Last page">
                <ChevronsRight className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

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

      <TransactionModal open={modalOpen} editing={editing} categories={categories}
        onClose={() => setModalOpen(false)} onSaved={load} />
    </>
  )
}
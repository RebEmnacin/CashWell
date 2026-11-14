import { animated, useSpring } from '@react-spring/web'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { errorMessage } from '../api/client'
import { budgetApi } from '../api/endpoints'
import MoneyInput from '../components/MoneyInput'
import PageHeader from '../components/PageHeader'
import { useCategories } from '../hooks/useCategories'
import { currentMonth, money, prettyMonth } from '../lib/format'
import type { Budget } from '../types'

/** Progress bar that grows smoothly with react-spring. Green -> amber -> red as you near the limit. */
function Bar({ percent }: { percent: number }) {
  const { width } = useSpring({ from: { width: 0 }, to: { width: Math.min(percent, 100) }, config: { tension: 140, friction: 24 } })
  const color = percent >= 100 ? 'bg-rose-500' : percent >= 80 ? 'bg-amber-500' : 'bg-brand-500'
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
      <animated.div className={`h-full rounded-full ${color}`} style={{ width: width.to((w) => `${w}%`) }} />
    </div>
  )
}

export default function Budgets() {
  const categories = useCategories()
  const [month, setMonth] = useState(currentMonth())
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // "Add budget" form
  const [newCat, setNewCat] = useState<number | ''>('')
  const [newAmount, setNewAmount] = useState('')

  // Inline editing of one budget's limit
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editAmount, setEditAmount] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setBudgets(await budgetApi.list(month))
      setError('')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => { load() }, [load])

  const available = categories.filter((c) => c.type === 'expense' && !budgets.some((b) => b.category_id === c.id))

  const add = async (e: FormEvent) => {
    e.preventDefault()
    const amount = Number(newAmount)
    if (!newCat || !amount || amount <= 0) return setError('Pick a category and enter an amount above 0.')
    try {
      await budgetApi.set(Number(newCat), amount)
      setNewCat('')
      setNewAmount('')
      load()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const saveEdit = async (categoryId: number) => {
    const amount = Number(editAmount)
    if (!amount || amount <= 0) return setError('Amount must be greater than 0.')
    try {
      await budgetApi.set(categoryId, amount)
      setEditingId(null)
      load()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const remove = async (b: Budget) => {
    if (!window.confirm(`Remove the ${b.category_name} budget?`)) return
    try {
      await budgetApi.remove(b.category_id)
      load()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)

  return (
    <>
      <PageHeader title="Budgets" subtitle={`Monthly limits · ${prettyMonth(month)}`}>
        <input type="month" aria-label="Month" className="input w-auto" value={month} max={currentMonth()}
          onChange={(e) => e.target.value && setMonth(e.target.value)} />
      </PageHeader>

      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">{error}</p>}

      {budgets.length > 0 && (
        <div className="card mb-5 animate-rise bg-brand-900 text-white">
          <p className="text-sm font-semibold text-emerald-100/70">Budgeted spending this month</p>
          <p className="mt-1 text-2xl font-extrabold">
            <span className="text-accent-400">{money(totalSpent)}</span> <span className="text-base font-semibold text-emerald-100/60">of {money(totalLimit)}</span>
          </p>
        </div>
      )}

      <form onSubmit={add} className="card mb-5 grid animate-rise gap-3 sm:grid-cols-[1fr_1fr_auto]" style={{ animationDelay: '60ms' }}>
        <select className="input" aria-label="Category" value={newCat}
          onChange={(e) => setNewCat(e.target.value ? Number(e.target.value) : '')}>
          <option value="">{available.length ? 'Choose a category…' : 'All categories have a budget'}</option>
          {available.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <MoneyInput className="input" placeholder="Monthly limit" aria-label="Monthly limit"
          value={newAmount} onChange={setNewAmount} />
        <button className="btn-primary" disabled={!available.length}><Plus className="size-4" /> Add budget</button>
      </form>

      {loading && budgets.length === 0 ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="card h-24 animate-pulse bg-slate-100" />)}</div>
      ) : budgets.length === 0 ? (
        <p className="card py-14 text-center text-sm text-slate-400">No budgets yet. Add one above to start tracking.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {budgets.map((b, i) => {
            const over = b.spent > b.limit
            return (
              <div key={b.category_id} className="card animate-rise" style={{ animationDelay: `${120 + i * 50}ms` }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="size-3 rounded-full" style={{ background: b.color }} />
                    <h3 className="font-extrabold">{b.category_name}</h3>
                  </div>
                  <div className="flex gap-1">
                    {editingId !== b.category_id && (
                      <button aria-label="Edit limit" onClick={() => { setEditingId(b.category_id); setEditAmount(Number(b.limit).toFixed(2)) }}
                        className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Pencil className="size-4" /></button>
                    )}
                    <button aria-label="Remove budget" onClick={() => remove(b)}
                      className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="size-4" /></button>
                  </div>
                </div>

                <div className="my-3"><Bar percent={b.percent} /></div>

                <div className="flex items-center justify-between text-sm">
                  <span className={`font-semibold ${over ? 'text-rose-600' : 'text-slate-700'}`}>
                    {money(b.spent)} <span className="font-medium text-slate-400">spent</span>
                  </span>
                  {editingId === b.category_id ? (
                    <span className="flex items-center gap-1">
                      <MoneyInput className="input !w-32 !py-1.5" value={editAmount} autoFocus
                        aria-label="New limit" onChange={setEditAmount}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(b.category_id)} />
                      <button aria-label="Save" onClick={() => saveEdit(b.category_id)}
                        className="cursor-pointer rounded-lg bg-brand-600 p-2 text-white hover:bg-brand-700"><Check className="size-4" /></button>
                      <button aria-label="Cancel" onClick={() => setEditingId(null)}
                        className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="size-4" /></button>
                    </span>
                  ) : (
                    <span className="text-slate-500">of {money(b.limit)}</span>
                  )}
                </div>

                <p className={`mt-2 text-xs font-semibold ${over ? 'text-rose-600' : b.percent >= 80 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {over ? `Over budget by ${money(b.spent - b.limit)}` : `${money(b.limit - b.spent)} left · ${Math.round(b.percent)}% used`}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
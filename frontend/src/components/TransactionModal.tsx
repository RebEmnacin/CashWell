import { animated, useTransition } from '@react-spring/web'
import { X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { errorMessage } from '../api/client'
import { transactionApi } from '../api/endpoints'
import { today } from '../lib/format'
import MoneyInput from './MoneyInput'
import type { Category, Transaction, TxType } from '../types'

interface Props {
  open: boolean
  editing: Transaction | null // null = creating a new one
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}

export default function TransactionModal({ open, editing, categories, onClose, onSaved }: Props) {
  const [type, setType] = useState<TxType>('expense')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(today())
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Fill the form whenever the modal opens (either blank, or with the row being edited)
  useEffect(() => {
    if (!open) return
    setError('')
    if (editing) {
      setType(editing.type)
      setCategoryId(editing.category_id)
      setAmount(String(editing.amount))
      setDescription(editing.description)
      setDate(editing.date)
    } else {
      setType('expense')
      setCategoryId('')
      setAmount('')
      setDescription('')
      setDate(today())
    }
  }, [open, editing])

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const transitions = useTransition(open, {
    from: { opacity: 0, y: 24, scale: 0.97 },
    enter: { opacity: 1, y: 0, scale: 1 },
    leave: { opacity: 0, y: 12, scale: 0.98 },
    config: { tension: 300, friction: 26 },
  })

  const options = categories.filter((c) => c.type === type)

  const switchType = (t: TxType) => {
    setType(t)
    setCategoryId('') // old category belongs to the other type
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const value = Number(amount)
    if (!categoryId) return setError('Please pick a category.')
    if (!value || value <= 0) return setError('Amount must be greater than 0.')

    setSaving(true)
    try {
      const payload = { category_id: Number(categoryId), amount: value, description, date }
      if (editing) await transactionApi.update(editing.id, payload)
      else await transactionApi.create(payload)
      onSaved()
      onClose()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return transitions((style, show) =>
    show ? (
      <animated.div style={{ opacity: style.opacity }} className="fixed inset-0 z-50 grid place-items-center p-4">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
        <animated.form
          onSubmit={submit}
          role="dialog"
          aria-modal="true"
          aria-label={editing ? 'Edit transaction' : 'Add transaction'}
          style={{ y: style.y, scale: style.scale }}
          className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">{editing ? 'Edit transaction' : 'New transaction'}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
              <X className="size-5" />
            </button>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
            {(['expense', 'income'] as TxType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchType(t)}
                className={`cursor-pointer rounded-lg py-2 text-sm font-semibold capitalize transition ${
                  type === t
                    ? t === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'bg-white text-brand-600 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="tx-amount">Amount</label>
              <MoneyInput id="tx-amount" className="input" placeholder="0.00" value={amount} onChange={setAmount} autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="tx-category">Category</label>
                <select id="tx-category" className="input" value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">Select…</option>
                  {options.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="tx-date">Date</label>
                <input id="tx-date" className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="tx-desc">Note</label>
              <input id="tx-desc" className="input" maxLength={200} placeholder="What was this for?"
                value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>

          {error && <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>}

          <div className="mt-6 flex gap-2">
            <button type="button" className="btn-ghost flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add transaction'}
            </button>
          </div>
        </animated.form>
      </animated.div>
    ) : null,
  )
}

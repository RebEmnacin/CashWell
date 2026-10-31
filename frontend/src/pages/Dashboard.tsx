import { ArrowDownRight, ArrowUpRight, Percent, Plus, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useCallback, useEffect, useState, type ComponentType } from 'react'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { analyticsApi, transactionApi } from '../api/endpoints'
import AnimatedNumber from '../components/AnimatedNumber'
import PageHeader from '../components/PageHeader'
import TransactionModal from '../components/TransactionModal'
import { useCategories } from '../hooks/useCategories'
import { compact, currentMonth, money, pctChange, prettyDate, prettyMonth } from '../lib/format'
import type { CategoryTotal, MonthlyPoint, Summary, Transaction } from '../types'

interface StatProps {
  label: string
  value: number
  format: (n: number) => string
  icon: ComponentType<{ className?: string }>
  tone: string // tailwind classes for the icon bubble
  change: number | null // % vs last month
  goodWhenUp: boolean
  delay: number
}

function StatCard({ label, value, format, icon: Icon, tone, change, goodWhenUp, delay }: StatProps) {
  const up = (change ?? 0) >= 0
  const good = change === null ? true : up === goodWhenUp
  return (
    <div className="card animate-rise" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500">{label}</span>
        <span className={`grid size-9 place-items-center rounded-xl ${tone}`}><Icon className="size-[18px]" /></span>
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight md:text-[1.7rem]">
        <AnimatedNumber value={value} format={format} />
      </p>
      <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-slate-400">
        {change === null ? (
          'No data last month'
        ) : (
          <>
            <span className={`inline-flex items-center ${good ? 'text-emerald-600' : 'text-rose-600'}`}>
              {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              {Math.abs(change).toFixed(1)}%
            </span>
            vs last month
          </>
        )}
      </p>
    </div>
  )
}

export default function Dashboard() {
  const [month, setMonth] = useState(currentMonth())
  const [summary, setSummary] = useState<Summary | null>(null)
  const [byCategory, setByCategory] = useState<CategoryTotal[]>([])
  const [monthly, setMonthly] = useState<MonthlyPoint[]>([])
  const [recent, setRecent] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const categories = useCategories()

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [s, c, m, r] = await Promise.all([
        analyticsApi.summary(month),
        analyticsApi.byCategory(month),
        analyticsApi.monthly(6),
        transactionApi.list({ limit: 6 }),
      ])
      setSummary(s)
      setByCategory(c)
      setMonthly(m)
      setRecent(r.items)
    } catch {
      setError('Could not load your dashboard. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => { load() }, [load])

  const expenseTotal = byCategory.reduce((sum, c) => sum + c.total, 0)

  return (
    <>
      <PageHeader title="Dashboard" subtitle={prettyMonth(month)}>
        <input type="month" aria-label="Month" className="input w-auto" value={month} max={currentMonth()}
          onChange={(e) => e.target.value && setMonth(e.target.value)} />
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus className="size-4" /> Add
        </button>
      </PageHeader>

      {error && <p role="alert" className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">{error}</p>}

      {loading && !summary ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="card h-32 animate-pulse bg-slate-100" />)}
        </div>
      ) : summary && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Net balance" value={summary.balance} format={money} icon={Wallet}
              tone="bg-brand-50 text-brand-600" change={null} goodWhenUp delay={0} />
            <StatCard label="Income" value={summary.income} format={money} icon={TrendingUp}
              tone="bg-emerald-50 text-emerald-600" change={pctChange(summary.income, summary.prev_income)} goodWhenUp delay={60} />
            <StatCard label="Expenses" value={summary.expense} format={money} icon={TrendingDown}
              tone="bg-rose-50 text-rose-600" change={pctChange(summary.expense, summary.prev_expense)} goodWhenUp={false} delay={120} />
            <StatCard label="Savings rate" value={summary.savings_rate} format={(n) => `${n.toFixed(1)}%`} icon={Percent}
              tone="bg-violet-50 text-violet-600" change={null} goodWhenUp delay={180} />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-5">
            <section className="card animate-rise lg:col-span-3" style={{ animationDelay: '240ms' }}>
              <h2 className="font-extrabold">Income vs expenses</h2>
              <p className="mb-4 text-xs text-slate-400">Last 6 months</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly} barGap={4} barCategoryGap="22%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tickLine={false} axisLine={false} width={48} tick={{ fontSize: 12, fill: '#64748b' }}
                      tickFormatter={(v) => compact(Number(v))} />
                    <Tooltip cursor={{ fill: 'rgba(148,163,184,0.12)' }} formatter={(v) => money(Number(v))}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expense" name="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="card animate-rise lg:col-span-2" style={{ animationDelay: '300ms' }}>
              <h2 className="font-extrabold">Spending by category</h2>
              <p className="mb-2 text-xs text-slate-400">{prettyMonth(month)}</p>
              {byCategory.length === 0 ? (
                <p className="grid h-64 place-items-center text-sm text-slate-400">No expenses this month yet.</p>
              ) : (
                <>
                  <div className="relative h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={byCategory} dataKey="total" nameKey="name" innerRadius={58} outerRadius={84}
                          paddingAngle={2} stroke="none">
                          {byCategory.map((c) => <Cell key={c.category_id} fill={c.color} />)}
                        </Pie>
                        <Tooltip formatter={(v) => money(Number(v))}
                          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Total</p>
                        <p className="text-sm font-extrabold">{compact(expenseTotal)}</p>
                      </div>
                    </div>
                  </div>
                  <ul className="mt-2 space-y-2">
                    {byCategory.slice(0, 5).map((c) => (
                      <li key={c.category_id} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-medium">
                          <span className="size-2.5 rounded-full" style={{ background: c.color }} />{c.name}
                        </span>
                        <span className="font-semibold text-slate-600">
                          {money(c.total)} <span className="text-xs text-slate-400">· {Math.round((c.total / expenseTotal) * 100)}%</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>

          <section className="card mt-5 animate-rise" style={{ animationDelay: '360ms' }}>
            <h2 className="mb-3 font-extrabold">Recent transactions</h2>
            {recent.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Nothing here yet. Add your first transaction!</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recent.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 py-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl text-white"
                      style={{ background: t.category.color }}>
                      {t.type === 'income' ? <ArrowUpRight className="size-5" /> : <ArrowDownRight className="size-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{t.description || t.category.name}</p>
                      <p className="text-xs text-slate-400">{t.category.name} · {prettyDate(t.date)}</p>
                    </div>
                    <p className={`text-sm font-extrabold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {t.type === 'income' ? '+' : '−'}{money(t.amount)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <TransactionModal open={modalOpen} editing={null} categories={categories}
        onClose={() => setModalOpen(false)} onSaved={load} />
    </>
  )
}

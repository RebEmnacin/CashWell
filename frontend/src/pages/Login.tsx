import { BarChart3, PiggyBank, ShieldCheck, TrendingUp } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { authApi } from '../api/endpoints'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const token = useAuthStore((s) => s.token)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (token) return <Navigate to="/" replace />

  const run = async (action: () => ReturnType<typeof authApi.demo>) => {
    setError('')
    setLoading(true)
    try {
      const res = await action()
      setAuth(res.access_token, res.user)
      navigate('/')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    run(() => (mode === 'login' ? authApi.login(email, password) : authApi.register(name, email, password)))
  }

  const features = [
    { icon: BarChart3, text: 'Clear charts of where your money goes' },
    { icon: PiggyBank, text: 'Monthly budgets with live progress' },
    { icon: ShieldCheck, text: 'Private by design: your data is only yours' },
  ]

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left brand panel */}
      <section className="relative hidden overflow-hidden bg-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <span>
            <img src="/CashWell_Logo.png" alt="CashWell" className="size-9 object-contain" />
          </span>
          <span className="text-xl font-extrabold tracking-tight">CashWell</span>
        </div>
        <div className="relative max-w-md animate-rise">
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight">
            Know where every peso goes.
          </h1>
          <p className="mt-5 text-lg text-emerald-100/75">
            Log income and expenses in seconds, then see the whole picture on one dashboard.
          </p>
          <ul className="mt-10 space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-emerald-50/90">
                <span className="grid size-9 place-items-center rounded-lg bg-white/10"><Icon className="size-[18px]" /></span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-emerald-100/50">Finance Tracker for Budget Breakdowns</p>
      </section>

      {/* Right form */}
      <section className="grid place-items-center px-5 py-10">
        <div className="w-full max-w-sm animate-rise">
          <div className="mb-8 flex items-center gap-2 font-extrabold lg:hidden">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white">
              <TrendingUp className="size-5" strokeWidth={2.5} />
            </span>
            CashWell
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'login' ? 'Log in to see your dashboard.' : 'It takes less than a minute.'}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === 'register' && (
              <div>
                <label className="label" htmlFor="name">Name</label>
                <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your name" required autoComplete="name" />
              </div>
            )}
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="username@domain.com" required autoComplete="email" />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" className="input" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </div>

            {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>}

            <button className="btn-primary w-full" disabled={loading}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" /> or <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button className="btn-ghost w-full" disabled={loading} onClick={() => run(authApi.demo)}>
            Try the demo account
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              className="cursor-pointer font-semibold text-brand-600 hover:underline"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </section>
    </div>
  )
}

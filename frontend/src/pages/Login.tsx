import { ArrowRight, Lock, Mail, User } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { authApi } from '../api/endpoints'
import { useAuthStore } from '../store/authStore'

/** One underlined input with a little icon on the left. */
function Field({
  icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  autoComplete,
  minLength,
}: {
  icon: ReactNode
  type?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  minLength?: number
}) {
  return (
    <div className="relative my-2.5 flex h-12 items-center">
      <span className="pointer-events-none absolute left-0 text-brand-600">{icon}</span>
      <input
        type={type}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-full w-full border-0 border-b-2 border-slate-300 bg-transparent pl-8 pr-2 text-[15px] font-medium text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-brand-600"
      />
    </div>
  )
}

export default function Login() {
  const token = useAuthStore((s) => s.token)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  // flipped = false -> sign in is showing, true -> sign up is showing
  const [flipped, setFlipped] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (token) return <Navigate to="/" replace />

  const flip = (toSignUp: boolean) => {
    setError('')
    setFlipped(toSignUp)
  }

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
    run(() => (flipped ? authApi.register(name, email, password) : authApi.login(email, password)))
  }

  const errorBox = error && (
    <p role="alert" className="mt-3 border-l-4 border-red-500 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
      {error}
    </p>
  )

  const linkBtn = 'cursor-pointer font-semibold text-brand-600 hover:underline'

  return (
    <div className="grid min-h-screen place-items-center bg-brand-900 p-4 sm:p-8">
      <div
        className="relative w-full max-w-[850px] bg-white px-6 py-10 shadow-2xl sm:px-8"
        style={{ perspective: '2700px' }}
      >
        {/* ---------- The flipping cover (desktop only) ---------- */}
        <div
          className="absolute left-1/2 top-0 z-10 h-full w-1/2 transition-transform duration-1000 ease-in-out max-[730px]:hidden"
          style={{
            transformOrigin: 'left',
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* front face (shown while Sign in is open) */}
          <div className="absolute inset-0 bg-brand-600" style={{ backfaceVisibility: 'hidden' }}>
            <CoverText title="Welcome back" sub="Sign in to see where your money went and where it's going." />
          </div>
          {/* back face (shown while Sign up is open) */}
          <div
            className="absolute inset-0 bg-brand-700"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <CoverText title="Start tracking" sub="Create a free account and take control of your budget today." />
          </div>
        </div>

        {/* ---------- The two forms ---------- */}
        <form onSubmit={submit} className="flex items-center justify-between max-[730px]:block">
          {/* Sign in */}
          <div
            className={`w-[calc(50%-25px)] max-[730px]:w-full ${flipped ? 'max-[730px]:hidden' : ''}`}
            inert={flipped}
          >
            <h2 className="relative pb-1 text-2xl font-medium text-ink after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-6 after:bg-brand-600">
              Sign in
            </h2>
            <div className="mt-6">
              <Field icon={<Mail className="size-[17px]" />} type="email" placeholder="Enter your email" value={email} onChange={setEmail} autoComplete="email" />
              <Field icon={<Lock className="size-[17px]" />} type="password" placeholder="Enter your password" value={password} onChange={setPassword} autoComplete="current-password" />
            </div>
            {!flipped && errorBox}
            <button type="submit" disabled={loading} className="btn-primary mt-8 h-12 w-full disabled:opacity-60">
              {loading && !flipped ? 'Signing in…' : 'Sign in'}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => run(authApi.demo)}
              className="btn-ghost mt-3 h-12 w-full disabled:opacity-60"
            >
              Try the demo account <ArrowRight className="size-4" />
            </button>
            <p className="mt-6 text-center text-sm font-medium text-slate-700">
              Don't have an account?{' '}
              <button type="button" className={linkBtn} onClick={() => flip(true)}>
                Sign up now
              </button>
            </p>
          </div>

          {/* Sign up */}
          <div
            className={`w-[calc(50%-25px)] max-[730px]:w-full ${flipped ? '' : 'max-[730px]:hidden'}`}
            inert={!flipped}
          >
            <h2 className="relative pb-1 text-2xl font-medium text-ink after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-5 after:bg-brand-600">
              Sign up
            </h2>
            <div className="mt-6">
              <Field icon={<User className="size-[17px]" />} placeholder="Enter your name" value={name} onChange={setName} autoComplete="name" />
              <Field icon={<Mail className="size-[17px]" />} type="email" placeholder="Enter your email" value={email} onChange={setEmail} autoComplete="email" />
              <Field icon={<Lock className="size-[17px]" />} type="password" placeholder="Create a password (min. 6)" value={password} onChange={setPassword} autoComplete="new-password" minLength={6} />
            </div>
            {flipped && errorBox}
            <button type="submit" disabled={loading} className="btn-primary mt-8 h-12 w-full disabled:opacity-60">
              {loading && flipped ? 'Creating account…' : 'Create account'}
            </button>
            <p className="mt-6 text-center text-sm font-medium text-slate-700">
              Already have an account?{' '}
              <button type="button" className={linkBtn} onClick={() => flip(false)}>
                Sign in now
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

/** Logo + headline that sit on the cover. */
function CoverText({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center text-white">
      <img
        src="/CashWell_Logo.png"
        alt=""
        className="size-20 object-contain"
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
      <p className="text-2xl font-semibold">{title}</p>
      <p className="text-sm font-medium text-white/80">{sub}</p>
      <p className="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-white/60">CashWell</p>
    </div>
  )
}
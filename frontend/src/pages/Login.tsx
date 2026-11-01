import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { authApi } from '../api/endpoints'
import { useAuthStore } from '../store/authStore'

const input =
  'block h-[42px] w-full border-0 border-b border-slate-200 bg-white px-4 text-[13px] text-ink outline-none placeholder:text-slate-400 last:border-b-0 focus:bg-brand-50'

export default function Login() {
  const token = useAuthStore((s) => s.token)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  // Which panel is open. The other one is "collapsed" (just its title is visible).
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (token) return <Navigate to="/" replace />

  const isLogin = mode === 'login'

  const switchTo = (next: 'login' | 'signup') => {
    setError('')
    setMode(next)
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

  const onLogin = (e: FormEvent) => {
    e.preventDefault()
    run(() => authApi.login(email, password))
  }

  const onSignup = (e: FormEvent) => {
    e.preventDefault()
    run(() => authApi.register(name, email, password))
  }

  const errorBox = error && (
    <p role="alert" className="mt-3 border-l-4 border-red-500 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
      {error}
    </p>
  )

  // things that fade out when a panel is collapsed
  const fade = (open: boolean) =>
    `transition-all duration-300 ${open ? 'visible opacity-100' : 'invisible opacity-0'}`

  return (
    <div className="grid min-h-screen place-items-center bg-[#f6f8f7] p-4">
      <div className="flex flex-col items-center gap-5">
        {/* Brand above the card */}
        <div className="flex items-center gap-3">
          <img
            src="/CashWell_Logo.png"
            alt=""
            className="size-10 object-contain"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <span className="text-2xl font-extrabold tracking-tight text-brand-900">CashWell</span>
        </div>

        {/* ---------- The card ---------- */}
        <div className="relative h-[560px] w-[350px] max-w-full overflow-hidden bg-brand-900 shadow-2xl">
          {/* soft green glow so the dark panel isn't flat */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_100%,rgba(16,185,129,0.45),transparent_60%),radial-gradient(circle_at_90%_0%,rgba(52,211,153,0.18),transparent_45%)]" />

          {/* ===== Sign up (top, dark) ===== */}
          <form
            onSubmit={onSignup}
            className={`absolute left-1/2 z-[5] w-[65%] -translate-x-1/2 transition-all duration-300 ease-out ${
              isLogin ? 'top-[5%] translate-y-0' : 'top-1/2 -translate-y-1/2'
            }`}
          >
            <h2 className="text-center">
              <button
                type="button"
                onClick={() => !isLogin || switchTo('signup')}
                tabIndex={isLogin ? 0 : -1}
                className={`font-semibold text-white transition-all duration-300 ${
                  isLogin ? 'cursor-pointer text-base' : 'cursor-default text-[1.7rem]'
                }`}
              >
                <span
                  className={`text-white/50 transition-all duration-300 ${
                    isLogin ? 'visible mr-1.5 opacity-100' : 'invisible opacity-0'
                  }`}
                >
                  or
                </span>
                Sign up
              </button>
            </h2>

            <div className={`mt-12 overflow-hidden bg-white ${fade(!isLogin)}`}>
              <input className={input} type="text" required placeholder="Name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
              <input className={input} type="email" required placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className={input} type="password" required minLength={6} placeholder="Password (min. 6)" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {!isLogin && errorBox}

            <button
              type="submit"
              disabled={loading}
              className={`mt-4 block w-full cursor-pointer bg-brand-600 px-6 py-3.5 text-[13px] font-bold text-white hover:bg-brand-500 disabled:opacity-60 ${fade(!isLogin)}`}
            >
              {loading && !isLogin ? 'Creating account…' : 'Sign up'}
            </button>
          </form>

          {/* ===== Log in (bottom, white, curved top) ===== */}
          <div
            className={`absolute inset-x-0 bottom-0 z-[5] bg-white transition-all duration-300 ease-out ${
              isLogin ? 'top-[20%]' : 'top-[90%]'
            }`}
          >
            {/* the big white ellipse that makes the curved edge */}
            <span className="pointer-events-none absolute -top-5 left-1/2 z-[4] h-[250px] w-[200%] -translate-x-1/2 rounded-[50%] bg-white" />

            <form
              onSubmit={onLogin}
              className={`absolute left-1/2 z-[5] w-[65%] -translate-x-1/2 transition-all duration-300 ease-out ${
                isLogin ? 'top-[40%] -translate-y-1/2' : 'top-[10%] translate-y-0'
              }`}
            >
              <h2 className="text-center">
                <button
                  type="button"
                  onClick={() => isLogin || switchTo('login')}
                  tabIndex={isLogin ? -1 : 0}
                  className={`font-semibold text-ink transition-all duration-300 ${
                    isLogin ? 'cursor-default text-[1.7rem]' : 'cursor-pointer text-base'
                  }`}
                >
                  <span
                    className={`text-slate-400 transition-all duration-300 ${
                      isLogin ? 'invisible opacity-0' : 'visible mr-1.5 opacity-100'
                    }`}
                  >
                    or
                  </span>
                  Log in
                </button>
              </h2>

              <div className={`mt-12 overflow-hidden border border-slate-200 bg-white ${fade(isLogin)}`}>
                <input className={input} type="email" required placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input className={input} type="password" required placeholder="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>

              {isLogin && errorBox}

              <button
                type="submit"
                disabled={loading}
                className={`mt-4 block w-full cursor-pointer bg-brand-600 px-6 py-3.5 text-[13px] font-bold text-white hover:bg-brand-700 disabled:opacity-60 ${fade(isLogin)}`}
              >
                {loading && isLogin ? 'Logging in…' : 'Log in'}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => run(authApi.demo)}
                className={`mx-auto mt-3 block cursor-pointer text-xs font-semibold text-brand-600 hover:underline disabled:opacity-60 ${fade(isLogin)}`}
              >
                Or try the demo account →
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
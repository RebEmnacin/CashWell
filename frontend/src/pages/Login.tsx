import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { authApi } from '../api/endpoints'
import { useAuthStore } from '../store/authStore'
import signInBg from '../assets/sign_in_up.png'

const field =
  'my-2.5 block w-full border-0 border-b-2 border-transparent bg-white px-5 py-4 text-base text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-brand-600 focus:bg-white'

const solidBtn =
  'mt-4 cursor-pointer rounded-full border border-brand-600 bg-brand-600 px-14 py-4 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-brand-700 active:scale-95 disabled:cursor-default disabled:opacity-60'

const ghostBtn =
  'cursor-pointer rounded-full border border-white bg-transparent px-14 py-4 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-white/15 active:scale-95'

// Everything moves with transform only (GPU-friendly). The forms slide across with the green panel, but they are
// faded out while the glass passes over them (leave early, arrive late), so no text shows through or overlaps.
const SLIDE =
  'transition-transform duration-[700ms] ease-[cubic-bezier(0.65,0,0.35,1)] will-change-transform motion-reduce:transition-none'
const FADE = 'transition-opacity ease-out motion-reduce:transition-none'
const textOut = 'pointer-events-none opacity-0 duration-150'
const textIn = 'opacity-100 duration-[250ms] delay-[450ms] max-[640px]:delay-100'
const formOut = 'pointer-events-none opacity-0 duration-200'
const formIn = 'opacity-100 duration-200 delay-[500ms] max-[640px]:delay-100'
const panelOut = 'opacity-0 duration-[300ms]'
const panelIn = 'opacity-100 duration-[450ms] delay-150 max-[640px]:delay-0'

export default function Login() {
  const token = useAuthStore((s) => s.token)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  // false = Sign in is showing, true = Sign up is showing (the overlay slides to the left)
  const [signUp, setSignUp] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // which fields failed the check on submit (field name -> message); they get a red box instead of the browser bubble
  const [invalid, setInvalid] = useState<Record<string, string>>({})

  if (token) return <Navigate to="/dashboard" replace />

  const switchTo = (toSignUp: boolean) => {
    setError('')
    setInvalid({})
    setSignUp(toSignUp)
  }

  const run = async (action: () => ReturnType<typeof authApi.demo>) => {
    setError('')
    setLoading(true)
    try {
      const res = await action()
      setAuth(res.access_token, res.user)
      navigate('/dashboard')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const check = (rules: Record<string, string | null>) => {
    const bad = Object.fromEntries(Object.entries(rules).filter(([, msg]) => msg)) as Record<string, string>
    setInvalid(bad)
    return Object.keys(bad).length === 0
  }
  const emailRule = !email.trim() ? 'Enter your email' : /^\S+@\S+\.\S+$/.test(email) ? null : 'Enter a valid email'

  const onSignIn = (e: FormEvent) => {
    e.preventDefault()
    if (!check({ email: emailRule, password: password ? null : 'Enter your password' })) return
    run(() => authApi.login(email, password))
  }

  const onSignUp = (e: FormEvent) => {
    e.preventDefault()
    if (
      !check({
        name: name.trim() ? null : 'Enter your name',
        email: emailRule,
        password: password.length >= 6 ? null : 'Use at least 6 characters',
      })
    )
      return
    run(() => authApi.register(name, email, password))
  }

  const errorBox = error && (
    <p role="alert" className="mt-2 w-full border-l-4 border-red-500 bg-red-50 px-3 py-2 text-left text-sm font-medium text-red-700">
      {error}
    </p>
  )

  const clear = (f: string) => setInvalid((v) => (v[f] ? { ...v, [f]: '' } : v))
  const fieldClass = (f: string) => (invalid[f] ? `${field} border-red-500! bg-red-50! placeholder:text-red-300` : field)
  const hint = (f: string) =>
    invalid[f] ? <span className="-mt-1.5 mb-1 block w-full text-left text-xs font-semibold text-red-600">{invalid[f]}</span> : null

  const formBox = 'relative flex h-full flex-col items-center justify-center px-16 text-center max-[640px]:px-6'
  const mobileSwitch = 'mt-5 hidden text-sm text-slate-600 max-[640px]:block'
  const linkBtn = 'cursor-pointer font-bold text-brand-600 hover:underline'

  return (
    <div className="relative grid min-h-screen grid-cols-[minmax(0,1fr)] place-items-center overflow-hidden bg-brand-900 p-4 md:max-[1499px]:pl-56 md:max-[1499px]:pr-8 min-[1500px]:pl-11">
      {/* backdrop: your photo (sign_in_up.png) */}
      <img
        src={signInBg}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full object-cover"
      />
      {/* green tint, same as the landing hero */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-linear-to-r from-brand-900/90 via-brand-900/70 to-brand-900/40" />
      <div className="relative w-[1040px] max-w-full">
        {/* The glass is its own still layer, next to the content and not inside it: a blur on the element that holds the
            moving panel gets redone every frame, and a blur inside an animated parent can't see the photo behind it. */}
        <div aria-hidden className="absolute inset-0 bg-white/10 shadow-2xl backdrop-blur-xl animate-rise" />
        <div className="relative min-h-[620px] overflow-hidden border border-white/30 animate-rise max-[640px]:min-h-[560px]">
        {/* ================= Sign in form (left half, slides right when Sign up opens) ================= */}
        <div inert={signUp} className={`absolute left-0 top-0 z-[2] h-full w-1/2 max-[640px]:w-full ${SLIDE} ${signUp ? 'translate-x-full max-[640px]:translate-x-0' : ''}`}>
          <div aria-hidden className={`absolute inset-0 bg-white/70 ${FADE} ${signUp ? panelOut : panelIn}`} />
          <form noValidate onSubmit={onSignIn} className={`${formBox} ${FADE} ${signUp ? formOut : formIn}`}>
            <h1 className="text-4xl font-extrabold text-brand-900">Sign in</h1>
            <p className="mb-4 mt-2 text-sm text-slate-500">Use your CashWell account</p>
            <input className={fieldClass('email')} aria-invalid={!!invalid.email} type="email" placeholder="Email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); clear('email') }} />
            {hint('email')}
            <input className={fieldClass('password')} aria-invalid={!!invalid.password} type="password" placeholder="Password" autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); clear('password') }} />
            {hint('password')}
            {!signUp && errorBox}
            <button type="submit" disabled={loading} className={solidBtn}>
              {loading && !signUp ? 'Signing in…' : 'Sign In'}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => run(authApi.demo)}
              className="mt-5 cursor-pointer text-sm font-semibold text-brand-600 hover:underline disabled:opacity-60"
            >
              Or try the demo account →
            </button>
            <p className={mobileSwitch}>
              New here?{' '}
              <button type="button" className={linkBtn} onClick={() => switchTo(true)}>
                Create an account
              </button>
            </p>
          </form>
        </div>

        {/* ================= Sign up form (waits under the panel, slides into the right half) ================= */}
        <div inert={!signUp} className={`absolute left-0 top-0 z-[2] h-full w-1/2 max-[640px]:w-full ${SLIDE} ${signUp ? 'translate-x-full max-[640px]:translate-x-0' : ''}`}>
          <div aria-hidden className={`absolute inset-0 bg-white/70 ${FADE} ${signUp ? panelIn : panelOut}`} />
          <form noValidate onSubmit={onSignUp} className={`${formBox} ${FADE} ${signUp ? formIn : formOut}`}>
            <h1 className="text-4xl font-extrabold text-brand-900">Create Account</h1>
            <p className="mb-4 mt-2 text-sm text-slate-500">Use your email to start tracking</p>
            <input className={fieldClass('name')} aria-invalid={!!invalid.name} type="text" placeholder="Name" autoComplete="name" value={name} onChange={(e) => { setName(e.target.value); clear('name') }} />
            {hint('name')}
            <input className={fieldClass('email')} aria-invalid={!!invalid.email} type="email" placeholder="Email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); clear('email') }} />
            {hint('email')}
            <input className={fieldClass('password')} aria-invalid={!!invalid.password} type="password" placeholder="Password (min. 6)" autoComplete="new-password" value={password} onChange={(e) => { setPassword(e.target.value); clear('password') }} />
            {hint('password')}
            {signUp && errorBox}
            <button type="submit" disabled={loading} className={solidBtn}>
              {loading && signUp ? 'Creating…' : 'Sign Up'}
            </button>
            <p className={mobileSwitch}>
              Already have an account?{' '}
              <button type="button" className={linkBtn} onClick={() => switchTo(false)}>
                Sign in
              </button>
            </p>
          </form>
        </div>

        {/* ================= Sliding green panel (desktop only) =================
            One rigid piece: it slides left/right and its logo never moves inside it.
            Only the two text blocks fade, so nothing drifts or clips while it slides. */}
        <div
          className={`absolute left-1/2 top-0 z-[100] h-full w-1/2 bg-brand-900/35 text-white max-[640px]:hidden ${SLIDE} ${
            signUp ? '-translate-x-full' : ''
          }`}
        >
          <div className="flex h-full flex-col items-center justify-center px-14 text-center">
            <Logo />
            <div className="grid">
              {/* shown while Sign in is open */}
              <div inert={signUp} className={`col-start-1 row-start-1 flex flex-col items-center ${FADE} ${signUp ? textOut : textIn}`}>
                <h1 className="text-4xl font-extrabold">Hello, Friend!</h1>
                <p className="mb-8 mt-5 text-base leading-6 tracking-wide text-white/85">
                  New to CashWell? Create a free account and take control of your money.
                </p>
                <button type="button" className={ghostBtn} onClick={() => switchTo(true)}>
                  Sign Up
                </button>
              </div>
              {/* shown while Sign up is open */}
              <div inert={!signUp} className={`col-start-1 row-start-1 flex flex-col items-center ${FADE} ${signUp ? textIn : textOut}`}>
                <h1 className="text-4xl font-extrabold">Welcome Back!</h1>
                <p className="mb-8 mt-5 text-base leading-6 tracking-wide text-white/85">
                  Already tracking with us? Sign in to pick up right where you left off.
                </p>
                <button type="button" className={ghostBtn} onClick={() => switchTo(false)}>
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

/** Logo that sits above the overlay headline (hides itself if the file is missing). */
function Logo() {
  return (
    <img
      src="/CashWell_Logo.png"
      alt="CashWell"
      className="mb-6 size-20 object-contain drop-shadow-xl"
      onError={(e) => (e.currentTarget.style.display = 'none')}
    />
  )
}
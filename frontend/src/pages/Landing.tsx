import {
  ArrowRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { authApi } from '../api/endpoints'
import { useAuthStore } from '../store/authStore'

/* ---------------- content (edit the text here) ---------------- */

const slides = [
  {
    title: 'Know where every peso goes',
    body: 'CashWell turns your income and spending into one clear picture. Add a transaction in seconds and watch your balance, categories and trends update right away.',
  },
  {
    title: 'Budgets that keep you honest',
    body: 'Set a monthly limit for each category and see how much is left at a glance. No spreadsheets, no guessing, just a bar that tells you when to slow down.',
  },
  {
    title: 'See it before you sign up',
    body: 'Curious? Open the demo account and explore a dashboard filled with six months of sample data. One click, no email needed.',
  },
]

const features: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: ReceiptText, title: 'Track every transaction', text: 'Log income and expenses with a category, date and note. Search and filter them later.' },
  { icon: PiggyBank, title: 'Monthly budgets', text: 'Give each category a limit and see your progress bar fill as you spend.' },
  { icon: BarChart3, title: 'Clear charts', text: 'Spending by category and income vs expenses over time, drawn for you.' },
  { icon: ShieldCheck, title: 'Your data, your login', text: 'Passwords are hashed and sessions use signed tokens. Only you see your numbers.' },
]

const steps = [
  { n: '01', title: 'Create your account', text: 'Sign up with your name, email and a password. It takes less than a minute.' },
  { n: '02', title: 'Add your money moves', text: 'Record what comes in and what goes out. Pick a category and you are done.' },
  { n: '03', title: 'Watch the picture appear', text: 'Your dashboard, charts and budgets build themselves from what you enter.' },
]

const bars = [40, 62, 48, 80, 58, 92]
const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']

/* ---------------- small helpers ---------------- */

/** Fades + slides its children up the first time they scroll into view. */
function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const primaryBtn =
  'inline-flex cursor-pointer items-center justify-center gap-2 bg-white px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-brand-900 transition hover:bg-brand-50 active:scale-95 disabled:opacity-60'
const outlineBtn =
  'inline-flex cursor-pointer items-center justify-center gap-2 border border-white/70 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-white/10 active:scale-95 disabled:opacity-60'

/* ---------------- the page ---------------- */

export default function Landing() {
  const token = useAuthStore((s) => s.token)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const [slide, setSlide] = useState(0)
  const [busy, setBusy] = useState(false)
  const [demoError, setDemoError] = useState('')

  // auto-advance the hero; picking a slide by hand restarts the timer
  useEffect(() => {
    const id = setTimeout(() => setSlide((s) => (s + 1) % slides.length), 7000)
    return () => clearTimeout(id)
  }, [slide])

  const go = (dir: 1 | -1) => setSlide((s) => (s + dir + slides.length) % slides.length)

  const tryDemo = async () => {
    setBusy(true)
    setDemoError('')
    try {
      const res = await authApi.demo()
      setAuth(res.access_token, res.user)
      navigate('/dashboard')
    } catch (err) {
      setDemoError(errorMessage(err))
      setBusy(false)
    }
  }

  const startBtn = token ? (
    <Link to="/dashboard" className={primaryBtn}>
      Open dashboard <ArrowRight className="size-4" />
    </Link>
  ) : (
    <Link to="/login" className={primaryBtn}>
      Get started <ArrowRight className="size-4" />
    </Link>
  )

  const current = slides[slide]

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-linear-to-br from-brand-900 via-brand-900 to-brand-700 text-white">
        {/* big faint rings in the background */}
        <div className="pointer-events-none absolute -left-40 -top-48 size-[520px] rounded-full border-[70px] border-white/[0.04]" />
        <div className="pointer-events-none absolute -bottom-56 right-[18%] size-[560px] rounded-full border-[70px] border-white/[0.05]" />
        <div className="pointer-events-none absolute right-[-120px] top-10 size-[320px] rounded-full border-[50px] border-brand-500/10" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:py-28 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="min-h-[300px] sm:min-h-[280px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <h1 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                    {current.title}
                  </h1>
                  <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">{current.body}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {startBtn}
              <button type="button" onClick={tryDemo} disabled={busy} className={outlineBtn}>
                {busy ? 'Opening…' : 'Try the demo'}
              </button>
            </div>
            {demoError && <p className="mt-3 text-sm font-medium text-red-300">{demoError}</p>}

            {/* slide controls */}
            <div className="mt-10 flex items-center gap-4">
              <button type="button" aria-label="Previous slide" onClick={() => go(-1)} className="grid size-10 cursor-pointer place-items-center border border-white/30 transition hover:bg-white/10">
                <ChevronLeft className="size-5" />
              </button>
              <div className="flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => setSlide(i)}
                    className={`h-1.5 cursor-pointer transition-all duration-300 ${i === slide ? 'w-10 bg-white' : 'w-5 bg-white/30 hover:bg-white/50'}`}
                  />
                ))}
              </div>
              <button type="button" aria-label="Next slide" onClick={() => go(1)} className="grid size-10 cursor-pointer place-items-center border border-white/30 transition hover:bg-white/10">
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>

          {/* promo card */}
          <motion.aside
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-[320px] bg-brand-600 p-8 text-center shadow-2xl"
          >
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-white/70">Free for everyone</p>
            <div className="my-4 h-1 bg-white/30" />
            <p className="text-6xl font-black leading-none">NEW</p>
            <p className="mt-2 text-2xl font-extrabold uppercase tracking-wide">here?</p>
            <div className="my-4 h-1 bg-white/30" />
            <Link
              to={token ? '/dashboard' : '/login'}
              className="mt-2 block bg-white px-4 py-3.5 text-lg font-black uppercase italic tracking-wide text-brand-700 transition hover:bg-brand-50"
            >
              {token ? 'Open app' : 'Join now'}
            </Link>
          </motion.aside>
        </div>
      </section>

      {/* ============ INTRO ============ */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Home</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight text-brand-600 md:text-4xl">
            CashWell: personal finance tracking, made simple
          </h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            CashWell helps you keep an honest eye on your money. Record what you earn and spend, set budgets for the
            categories that matter, and let the charts do the maths. It is built to be quick to use, so you actually keep using it.
          </p>
        </Reveal>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <Reveal>
            <h2 className="text-3xl font-extrabold text-ink">Everything you need, nothing you don't</h2>
            <p className="mt-3 max-w-2xl text-slate-600">Four things CashWell does well.</p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <div className="group h-full border border-slate-200 bg-[#f6f8f7] p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-500 hover:shadow-lg">
                  <span className="grid size-12 place-items-center rounded-full bg-brand-600 text-white transition group-hover:scale-110">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <Reveal>
          <h2 className="text-3xl font-extrabold text-ink">How it works</h2>
        </Reveal>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12}>
              <div className="border-t-4 border-brand-600 pt-5">
                <p className="text-5xl font-black text-brand-100">{s.n}</p>
                <h3 className="mt-3 text-xl font-extrabold text-ink">{s.title}</h3>
                <p className="mt-2 leading-7 text-slate-600">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ DASHBOARD PREVIEW ============ */}
      <section className="bg-brand-900 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:py-20 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">A dashboard that tells the story at a glance</h2>
            <p className="mt-5 text-lg leading-8 text-white/80">
              Balance, income, expenses and a six month trend sit on one screen. Click around the demo account to see
              it with real looking data.
            </p>
            <button type="button" onClick={tryDemo} disabled={busy} className={`${primaryBtn} mt-8`}>
              {busy ? 'Opening…' : 'Explore the demo'} <ArrowRight className="size-4" />
            </button>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="bg-white p-6 text-ink shadow-2xl">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Sample preview</p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  ['Balance', '₱48,200'],
                  ['Income', '₱62,000'],
                  ['Expenses', '₱13,800'],
                ].map(([k, v]) => (
                  <div key={k} className="bg-[#f6f8f7] p-3">
                    <p className="text-[11px] font-semibold text-slate-500">{k}</p>
                    <p className="mt-1 text-lg font-extrabold text-brand-700">{v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex h-40 items-end gap-3">
                {bars.map((h, i) => (
                  <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full bg-brand-600"
                    />
                    <span className="text-[10px] font-semibold text-slate-400">{months[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <Reveal>
          <h2 className="text-3xl font-extrabold text-ink md:text-4xl">Ready to see where your money goes?</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">Create a free account, or have a look around with the demo first.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to={token ? '/dashboard' : '/login'}
              className="inline-flex items-center gap-2 bg-brand-600 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-brand-700 active:scale-95"
            >
              {token ? 'Open dashboard' : 'Get started'} <ArrowRight className="size-4" />
            </Link>
            <button
              type="button"
              onClick={tryDemo}
              disabled={busy}
              className="inline-flex cursor-pointer items-center gap-2 border border-brand-600 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-brand-600 transition hover:bg-brand-50 active:scale-95 disabled:opacity-60"
            >
              Try the demo
            </button>
          </div>
        </Reveal>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-sm text-slate-500">
          <p>© 2026 CashWell. A full-stack portfolio project.</p>
          <div className="flex gap-5 font-semibold">
            <Link to="/" className="hover:text-brand-600">Home</Link>
            <Link to="/login" className="hover:text-brand-600">Login / Sign up</Link>
            <Link to="/about" className="hover:text-brand-600">About us</Link>
          </div>
        </div>
      </footer>
    </>
  )
}

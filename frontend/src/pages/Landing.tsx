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
import AnimatedIcon from '../components/AnimatedIcon'
import JarCoins from '../components/JarCoins'
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
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-brand-900 transition hover:bg-brand-50 active:scale-95 disabled:opacity-60'
const outlineBtn =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/70 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-white/10 active:scale-95 disabled:opacity-60'

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
      <div className="relative">
        <section className="relative overflow-hidden rounded-b-[50%_60px] bg-brand-900 text-white md:rounded-b-[50%_120px]">
          <div className="relative mx-auto max-w-6xl px-6 pb-32 pt-8 md:pl-28 md:pb-36">
            {/* brand mark, top left */}
            <div className="flex items-center gap-3">
              <img src="/CashWell_Logo.png" alt="" className="size-9 object-contain" />
              <span className="text-lg font-extrabold tracking-tight">CashWell</span>
            </div>

            <div className="mt-10 grid items-center gap-x-12 gap-y-8 lg:mt-6 lg:grid-cols-[1fr_380px]">
              {/* text side */}
              <div className="lg:col-start-1 lg:row-start-1">
                <div className="min-h-[300px] sm:min-h-[280px] lg:min-h-[240px]">
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
              </div>

              {/* image side: a jar tipping over and pouring coins (animated SVG) */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="relative order-3 mx-auto grid w-full max-w-[300px] place-items-center lg:order-none lg:col-start-2 lg:row-start-1 lg:max-w-[380px]"
              >
                <JarCoins className="w-full max-w-[380px]" />
              </motion.div>
              {/* slide controls: plain arrows only (plus horizontal dots on phones), no hover highlight.
                  Phones: right under the buttons. Desktop: under the text column. */}
            <div className="order-2 flex items-center gap-4 lg:order-none lg:col-start-1 lg:row-start-2">
                <button type="button" aria-label="Previous slide" onClick={() => go(-1)} className="grid size-10 cursor-pointer place-items-center text-white">
                  <ChevronLeft className="size-8" strokeWidth={1.75} />
                </button>
                <div className="flex gap-2 lg:hidden">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Go to slide ${i + 1}`}
                      onClick={() => setSlide(i)}
                      className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${i === slide ? 'w-10 bg-white' : 'w-5 bg-white/30'}`}
                    />
                  ))}
                </div>
                <button type="button" aria-label="Next slide" onClick={() => go(1)} className="grid size-10 cursor-pointer place-items-center text-white">
                  <ChevronRight className="size-8" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          </div>

          {/* vertical slide dots on the right edge (desktop) */}
          <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setSlide(i)}
                className={`w-1.5 cursor-pointer rounded-full transition-all duration-300 ${i === slide ? 'h-10 bg-white' : 'h-5 bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>
        </section>

        {/* floating pill bar straddling the bottom edge of the hero (the old "NEW here?" card) */}
        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-1/2">
         <div className="mx-auto max-w-6xl px-6 md:pl-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full flex-col items-stretch gap-3 rounded-[2rem] bg-brand-100 p-3 shadow-2xl ring-[10px] ring-[#f6f8f7] md:flex-row md:items-center md:rounded-full"
          >
            <div className="flex flex-1 items-center justify-between gap-4 rounded-full bg-white px-6 py-3.5 text-brand-900">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">Free for everyone</p>
              <p className="text-lg font-black uppercase tracking-wide">
                New <span className="text-brand-600">here?</span>
              </p>
            </div>
            <Link
              to={token ? '/dashboard' : '/login'}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-8 py-4 text-sm font-black uppercase italic tracking-wider text-white transition hover:bg-brand-700 active:scale-95"
            >
              {token ? 'Open app' : 'Join now'} <ArrowRight className="size-4" />
            </Link>
          </motion.div>
         </div>
        </div>
      </div>

      {/* ============ INTRO ============ */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-32 md:pl-28 md:pb-20 lg:grid-cols-2">
        {/* image card with round badges */}
        <Reveal>
          <div className="relative mx-auto max-w-md">
            <div className="rotate-[-2deg] rounded-[1.75rem] bg-white p-3 shadow-xl ring-1 ring-slate-200">
              <div className="grid aspect-[4/3] place-items-center rounded-[1.25rem] bg-linear-to-br from-brand-900 via-brand-900 to-brand-700">
                <img src="/CashWell_Logo.png" alt="CashWell logo" className="w-1/2 object-contain" />
              </div>
            </div>
            <span className="absolute -left-5 -top-5 grid size-20 place-items-center rounded-full bg-brand-600 text-center text-[11px] font-extrabold uppercase leading-tight text-white shadow-lg ring-4 ring-white">
              Made<br />simple
            </span>
            <span className="absolute -bottom-4 -right-4 grid size-14 place-items-center rounded-full bg-white text-brand-600 shadow-lg ring-4 ring-brand-100">
              <AnimatedIcon icon={PiggyBank} className="size-6" delay={0.4} />
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Home</p>
          <h2 className="mt-3 max-w-xl text-3xl font-extrabold leading-tight text-brand-600 md:text-4xl">
            CashWell: personal finance tracking, made simple
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            CashWell helps you keep an honest eye on your money. Record what you earn and spend, set budgets for the
            categories that matter, and let the charts do the maths. It is built to be quick to use, so you actually keep using it.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              to={token ? '/dashboard' : '/login'}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-brand-700 active:scale-95"
            >
              {token ? 'Open dashboard' : 'Get started'} <ArrowRight className="size-4" />
            </Link>
            <Link to="/about" className="text-sm font-bold uppercase tracking-wider text-brand-600 underline-offset-4 hover:underline">
              About us
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="bg-brand-50">
        <div className="mx-auto max-w-6xl px-6 py-16 md:pl-28 md:py-20">
          <Reveal className="text-center">
            <h2 className="text-3xl font-extrabold text-ink">Everything you need, nothing you don't</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">Four things CashWell does well.</p>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <div className="group h-full rounded-none bg-white p-8 text-center shadow-md ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  {/* big graphic icon: solid disc with a soft ring around it */}
                  <span className="mx-auto grid size-32 place-items-center rounded-full bg-brand-50 ring-1 ring-brand-100 transition duration-300 group-hover:scale-105">
                    <span className="grid size-24 place-items-center rounded-full bg-brand-600 text-white shadow-lg">
                      <AnimatedIcon icon={Icon} className="size-12" strokeWidth={1.75} delay={0.2 + i * 0.15} />
                    </span>
                  </span>
                  <h3 className="mt-6 text-lg font-extrabold text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:pl-28 md:py-20 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <Reveal>
          <h2 className="text-3xl font-extrabold text-ink md:text-4xl">How it works</h2>
        </Reveal>
        <div className="relative">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12} className="group relative pb-12 last:pb-0">
              <span className="absolute -bottom-6 left-6 top-6 w-0.5 -translate-x-1/2 bg-brand-100 group-last:hidden" aria-hidden />
              <div className="relative flex gap-6">
                <span className="relative grid size-12 shrink-0 place-items-center rounded-full bg-brand-600 text-base font-extrabold text-white ring-8 ring-[#f6f8f7]">
                  {i + 1}
                </span>
                <div className="pt-1.5">
                  <h3 className="text-xl font-extrabold text-ink">{s.title}</h3>
                  <p className="mt-1.5 max-w-lg leading-7 text-slate-600">{s.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ DASHBOARD PREVIEW ============ */}
      <section className="bg-brand-900 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:pl-28 py-16 md:py-20 lg:grid-cols-2">
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
      <section className="mx-auto max-w-6xl px-6 md:px-28 py-20 text-center">
        <Reveal>
          <h2 className="text-3xl font-extrabold text-ink md:text-4xl">Ready to see where your money goes?</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">Create a free account, or have a look around with the demo first.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to={token ? '/dashboard' : '/login'}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-brand-700 active:scale-95"
            >
              {token ? 'Open dashboard' : 'Get started'} <ArrowRight className="size-4" />
            </Link>
            <button
              type="button"
              onClick={tryDemo}
              disabled={busy}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-600 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-brand-600 transition hover:bg-brand-50 active:scale-95 disabled:opacity-60"
            >
              Try the demo
            </button>
          </div>
        </Reveal>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 md:pl-28 py-6 text-sm text-slate-500">
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
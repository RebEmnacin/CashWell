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
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { authApi } from '../api/endpoints'
import AnimatedIcon from '../components/AnimatedIcon'
import HandCalculator from '../components/HandCalculator'
import JarCoins from '../components/JarCoins'
import Receipt, { type ReceiptLine } from '../components/Receipt'
import Scrub, { type ScrubFrom } from '../components/Scrub'
import SpreadSheet from '../components/SpreadSheet'
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

// "How it works": one RECEIPT per step, hanging on a line (see components/Receipt.tsx)
const steps: { no: string; title: string; lines: ReceiptLine[]; totalLabel: string; totalValue: string }[] = [
  {
    no: '0001',
    title: 'Create your account',
    lines: [
      { label: 'Your name', value: 'done' },
      { label: 'Email', value: 'done' },
      { label: 'Password', value: 'done' },
    ],
    totalLabel: 'Time spent',
    totalValue: '< 1 min',
  },
  {
    no: '0002',
    title: 'Add your money moves',
    lines: [
      { label: 'Salary', value: '+₱62,000', tone: 'plus' },
      { label: 'Groceries', value: '-₱1,250', tone: 'minus' },
      { label: 'Coffee', value: '-₱120', tone: 'minus' },
    ],
    totalLabel: 'Balance',
    totalValue: '₱60,630',
  },
  {
    no: '0003',
    title: 'Watch the picture appear',
    lines: [
      { label: 'Dashboard', value: 'ready' },
      { label: 'Charts', value: 'ready' },
      { label: 'Budgets', value: 'ready' },
    ],
    totalLabel: 'Built for you',
    totalValue: 'auto',
  },
]

const bars = [40, 62, 48, 80, 58, 92]
const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']

/* ---------------- small helpers ---------------- */

const primaryBtn =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-[18px] bg-accent-400 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-brand-900 shadow-[0_3px_0_0_var(--color-accent-600)] transition hover:bg-accent-500 active:translate-y-[3px] active:shadow-none disabled:opacity-60'
const outlineBtn =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-[18px] border border-white/70 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-white/10 active:scale-95 disabled:opacity-60'

// big section titles, small labels, and the colour of each feature panel
const bigHeading = 'text-balance text-4xl font-black leading-[1.08] tracking-tight text-ink md:text-5xl lg:text-6xl'
const eyebrowLight = 'text-sm font-bold uppercase tracking-[0.2em] text-accent-700'
const eyebrowDark = 'inline-block border border-accent-400/50 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-accent-400'
const tones = [
  { card: 'bg-brand-900 text-white', tile: 'bg-white/15 text-white' },
  { card: 'bg-accent-50 text-ink ring-1 ring-accent-100', tile: 'bg-accent-400 text-brand-900' },
  { card: 'bg-brand-100 text-ink', tile: 'bg-brand-600 text-white' },
  { card: 'bg-brand-600 text-white', tile: 'bg-white/20 text-white' },
]

// where each panel starts: swing in from the left, rise from below, drop from above, swing in from the right
const poses4: ScrubFrom[] = [
  { x: -110, rotateY: 35, rotateX: 12, scale: 0.82 },
  { y: 150, rotateX: 30, scale: 0.72 },
  { y: -110, rotateX: -26, scale: 0.8 },
  { x: 110, rotateY: -35, rotateX: 12, scale: 0.82 },
]
const poses3: ScrubFrom[] = [
  { x: -120, rotateY: 35, rotateX: 12, scale: 0.82 },
  { y: 150, rotateX: 30, scale: 0.72 },
  { x: 120, rotateY: -35, rotateX: 12, scale: 0.82 },
]

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

  // the wrapper clips at the SCREEN edge, so panels sliding in from the side are not cut off by their own section
  return (
    <div className="overflow-clip">
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
                      className={`h-1.5 cursor-pointer rounded-[3px] transition-all duration-300 ${i === slide ? 'w-10 bg-accent-400' : 'w-5 bg-white/30'}`}
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
                className={`w-1.5 cursor-pointer rounded-[3px] transition-all duration-300 ${i === slide ? 'h-10 bg-accent-400' : 'h-5 bg-white/30 hover:bg-white/50'}`}
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
            <div className="flex flex-1 items-center justify-between gap-4 rounded-[16px] bg-white px-6 py-3.5 text-brand-900">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent-700">Free for everyone</p>
              <p className="text-lg font-black uppercase tracking-wide">
                New <span className="text-accent-600">here?</span>
              </p>
            </div>
            <Link
              to={token ? '/dashboard' : '/login'}
              className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-accent-400 px-8 py-4 text-sm font-black uppercase italic tracking-wider text-brand-900 shadow-[0_3px_0_0_var(--color-accent-600)] transition hover:bg-accent-500 active:translate-y-[3px] active:shadow-none"
            >
              {token ? 'Open app' : 'Join now'} <ArrowRight className="size-4" />
            </Link>
          </motion.div>
         </div>
        </div>
      </div>

      {/* ============ INTRO ============ */}
      <section className="pt-24 md:pt-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:pl-28 md:py-20 lg:grid-cols-2">
          {/* image card with round badges */}
          <Scrub from={{ y: -60, scale: 0.9, rotateX: -16 }} offset={['start end', 'center 0.6']}>
            <div className="relative mx-auto max-w-md">
              <div className="rotate-[-2deg] rounded-[1.75rem] bg-white p-3 shadow-[-6px_12px_34px_rgba(5,40,10,0.25)] ring-1 ring-slate-200">
                <div className="grid aspect-[4/3] place-items-center rounded-[1.25rem] bg-linear-to-br from-brand-900 via-brand-900 to-brand-700">
                  <HandCalculator className="-mt-6 w-[80%]" />
                </div>
              </div>
              <span className="absolute -left-5 -top-5 grid size-20 place-items-center rounded-full bg-accent-400 text-center text-[11px] font-extrabold uppercase leading-tight text-brand-900 shadow-lg ring-4 ring-white">
                Made<br />simple
              </span>
              <span className="absolute -bottom-4 -right-4 grid size-14 place-items-center rounded-full bg-white text-brand-600 shadow-lg ring-4 ring-brand-100">
                <AnimatedIcon icon={PiggyBank} className="size-6" delay={0.4} />
              </span>
            </div>
          </Scrub>

          <Scrub from={{ y: 60, scale: 0.94 }} offset={['start end', 'center 0.6']}>
            <p className={eyebrowLight}>Home</p>
            <h2 className="mt-4 max-w-xl text-balance text-4xl font-black leading-[1.08] tracking-tight text-ink md:text-5xl">
              Personal finance tracking, <em className="not-italic text-brand-600">made simple.</em>
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              CashWell helps you keep an honest eye on your money. Record what you earn and spend, set budgets for the
              categories that matter, and let the charts do the maths. It is built to be quick to use, so you actually keep using it.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link to={token ? '/dashboard' : '/login'} className={primaryBtn}>
                {token ? 'Open dashboard' : 'Get started'} <ArrowRight className="size-4" />
              </Link>
              <Link to="/about" className="text-sm font-bold uppercase tracking-wider text-brand-600 underline-offset-4 hover:underline">
                About us
              </Link>
            </div>
          </Scrub>
        </div>
      </section>

      {/* ============ FEATURES: four coloured panels, each arriving from a different direction ============ */}
      <section className="mx-auto max-w-6xl px-6 pb-28 pt-8 md:pl-28 md:pb-36">
        <Scrub from={{ scale: 1.35, y: 60 }} offset={['start end', 'start 0.55']} className="text-center">
          <h2 className={bigHeading}>
            Everything you need, <em className="block not-italic text-brand-600">nothing you don't.</em>
          </h2>
        </Scrub>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }, i) => (
            <Scrub key={title} from={poses4[i]} offset={['start end', 'start 0.75']}>
              <div className={`group h-full min-h-[240px] p-7 shadow-[-6px_12px_34px_rgba(5,40,10,0.28)] ${tones[i].card}`}>
                <span className={`grid size-12 place-items-center transition duration-300 group-hover:scale-110 ${tones[i].tile}`}>
                  <AnimatedIcon icon={Icon} className="size-6" strokeWidth={1.75} delay={0.2 + i * 0.15} />
                </span>
                <h3 className="mt-5 text-xl font-extrabold leading-snug">{title}</h3>
                <p className="mt-2 text-[0.95rem] leading-6 opacity-80">{text}</p>
              </div>
            </Scrub>
          ))}
        </div>
      </section>

      {/* ============ THE DARK SHEET: starts as a small rounded panel and spreads to the edges (like HireRise) ============ */}
      <SpreadSheet className="bg-brand-900 text-white" inset="4%" radius={56} offset={['start end', 'start 0.3']}>
        {/* HOW IT WORKS */}
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-24 md:pl-28 md:pt-32">
          <Scrub from={{ scale: 1.35, y: 60 }} offset={['start end', 'start 0.55']} className="text-center">
            <p className={eyebrowDark}>How it works</p>
            <h2 className={`${bigHeading} mt-5 text-white`}>
              Three receipts, <em className="block not-italic text-accent-400">hung up in order.</em>
            </h2>
          </Scrub>

          {/* three receipts hang on a line that fills as you scroll; they swing in from left, below and right */}
          <div className="relative mt-16 pt-4">
            <div aria-hidden className="absolute inset-x-[6%] top-4 hidden h-0.5 bg-white/15 md:block">
              <Scrub from={{ scaleX: 0 }} origin="left" offset={['start 0.95', 'start 0.45']} className="h-full bg-accent-400" />
            </div>
            <div className="grid gap-10 md:grid-cols-3 md:gap-6">
              {steps.map((s, i) => (
                <Scrub key={s.no} from={poses3[i]} offset={['start end', 'start 0.7']}>
                  <Receipt no={s.no} title={s.title} lines={s.lines} totalLabel={s.totalLabel} totalValue={s.totalValue} />
                </Scrub>
              ))}
            </div>
          </div>
        </section>

        {/* DASHBOARD PREVIEW: a lighter green panel that zooms out from a big, tilted view */}
        <section className="mx-auto max-w-6xl px-6 py-16 md:pl-28">
          <Scrub from={{ scale: 1.25, rotateX: -14, y: 80 }} offset={['start end', 'start 0.25']}>
            <div className="bg-[#0a4a12] px-6 py-12 shadow-[0_30px_70px_rgba(0,0,0,0.35)] md:px-12 md:py-16">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div>
                  <p className={eyebrowDark}>Dashboard</p>
                  <h2 className="mt-5 text-balance text-3xl font-black leading-[1.1] tracking-tight md:text-5xl">
                    The story of your money, <em className="not-italic text-accent-400">at a glance.</em>
                  </h2>
                  <p className="mt-5 text-lg leading-8 text-white/80">
                    Balance, income, expenses and a six month trend sit on one screen. Click around the demo account to see
                    it with real looking data.
                  </p>
                  <button type="button" onClick={tryDemo} disabled={busy} className={`${primaryBtn} mt-8`}>
                    {busy ? 'Opening…' : 'Explore the demo'} <ArrowRight className="size-4" />
                  </button>
                </div>

                <Scrub from={{ y: 60, rotateZ: 4, scale: 0.92 }} offset={['start end', 'center 0.65']}>
                  <div className="bg-white p-4 text-ink shadow-2xl sm:p-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Sample preview</p>
                    <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                      {[
                        ['Balance', '₱48,200'],
                        ['Income', '₱62,000'],
                        ['Expenses', '₱13,800'],
                      ].map(([k, v]) => (
                        <div key={k} className="min-w-0 bg-[#f6f8f7] p-2 sm:p-3">
                          <p className="text-[11px] font-semibold text-slate-500">{k}</p>
                          <p className="mt-1 text-[13px] font-extrabold text-brand-700 sm:text-lg">{v}</p>
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
                            className={`w-full ${i === bars.length - 1 ? 'bg-accent-400' : 'bg-brand-600'}`}
                          />
                          <span className="text-[10px] font-semibold text-slate-400">{months[i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Scrub>
              </div>
            </div>
          </Scrub>
        </section>

        {/* FINAL CTA */}
        <section className="mx-auto max-w-6xl px-6 pb-24 pt-20 text-center md:px-28">
          <Scrub from={{ scale: 1.2, y: 50 }} offset={['start end', 'start 0.6']}>
            <h2 className={`${bigHeading} text-white`}>
              Ready to see <em className="block not-italic text-accent-400">where your money goes?</em>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-white/80">Create a free account, or have a look around with the demo first.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to={token ? '/dashboard' : '/login'} className={primaryBtn}>
                {token ? 'Open dashboard' : 'Get started'} <ArrowRight className="size-4" />
              </Link>
              <button type="button" onClick={tryDemo} disabled={busy} className={outlineBtn}>
                Try the demo
              </button>
            </div>
          </Scrub>
        </section>

        {/* =========== FOOTER =========== */}
        <footer className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-sm text-white/60 md:pl-28">
            <p>© 2026 CashWell. A full-stack portfolio project.</p>
            <div className="flex gap-5 font-semibold">
              <Link to="/" className="hover:text-white">Home</Link>
              <Link to="/login" className="hover:text-white">Login / Sign up</Link>
              <Link to="/about" className="hover:text-white">About us</Link>
            </div>
          </div>
        </footer>
      </SpreadSheet>
    </div>
  )
}
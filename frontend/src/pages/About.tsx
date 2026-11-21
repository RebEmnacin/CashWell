import { ArrowRight, Check, Eye, Feather, Lock, type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import AnimatedIcon from '../components/AnimatedIcon'
import ReceiptPrinter from '../components/ReceiptPrinter'
import Scrub, { type ScrubFrom } from '../components/Scrub'
import SpreadSheet from '../components/SpreadSheet'

/* ---------------- content (edit the text here) ---------------- */

const values: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Feather, title: 'Simple', text: 'Money tracking should take seconds, not an evening. Every screen does one job and does it clearly.' },
  { icon: Eye, title: 'Clear', text: 'Numbers are only useful when you can read them. Charts and budgets show the story instead of a wall of rows.' },
  { icon: Lock, title: 'Private', text: 'Your data belongs to you. Passwords are hashed and every request is checked against your own login.' },
]

const stack = [
  { name: 'React + TypeScript', why: 'Reusable components, and the compiler catches mistakes before you do.' },
  { name: 'Tailwind CSS', why: 'Fast, consistent styling without leaving the markup.' },
  { name: 'Motion', why: 'Smooth, physics-based animation for the sidebar and scroll reveals.' },
  { name: 'FastAPI', why: 'A quick Python API with automatic validation and docs.' },
  { name: 'SQLAlchemy', why: 'One data layer that runs on SQLite locally and Postgres online.' },
  { name: 'JWT sessions', why: 'Stateless login that works well with a separate frontend.' },
]

const bigHeading = 'text-balance text-4xl font-black leading-[1.08] tracking-tight text-ink md:text-5xl lg:text-6xl'
const eyebrowDark = 'inline-block border border-accent-400/50 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-accent-400'

// the three value panels have their own colour and their own way in: from the left, from below, from the right
const tones = [
  { card: 'bg-brand-900 text-white', tile: 'bg-white/15 text-white' },
  { card: 'bg-accent-50 text-ink ring-1 ring-accent-100', tile: 'bg-accent-400 text-brand-900' },
  { card: 'bg-brand-100 text-ink', tile: 'bg-brand-600 text-white' },
]
const poses3: ScrubFrom[] = [
  { x: -120, rotateY: 35, rotateX: 12, scale: 0.82 },
  { y: 150, rotateX: 30, scale: 0.72 },
  { x: 120, rotateY: -35, rotateX: 12, scale: 0.82 },
]

export default function About() {
  // the wrapper clips at the SCREEN edge, so panels sliding in from the side are not cut off by their own section
  return (
    <div className="overflow-clip">
      {/* header band */}
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-8 md:pl-28 md:pb-24">
          {/* brand mark, top left (same as the home page) */}
          <div className="flex items-center gap-3">
            <img src="/CashWell_Logo.png" alt="" className="size-9 object-contain" />
            <span className="text-lg font-extrabold tracking-tight">CashWell</span>
          </div>

          <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1fr_420px]">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-sm font-bold uppercase tracking-[0.2em] text-accent-400"
              >
                About us
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="mt-4 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
              >
                Money tracking that stays out of your way
              </motion.h1>
            </div>
            <ReceiptPrinter className="mx-auto hidden w-full max-w-[400px] lg:block" />
          </div>
        </div>
      </section>

      {/* story */}
      <section>
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:pl-28 md:py-28 lg:grid-cols-[1fr_2fr]">
          <Scrub from={{ scale: 1.3, y: 50 }} offset={['start end', 'start 0.55']}>
            <h2 className="text-balance text-4xl font-black leading-[1.08] tracking-tight text-ink md:text-5xl">
              Why CashWell <em className="block not-italic text-brand-600">exists.</em>
            </h2>
            <span className="mt-5 block h-1 w-12 bg-accent-400" />
          </Scrub>
          <div className="space-y-5 text-lg leading-8 text-slate-600">
            <Scrub from={{ y: 60, scale: 0.95 }} offset={['start end', 'center 0.7']}>
              <p>
                CashWell is a personal finance tracker built as a full-stack portfolio project. The idea is simple: most
                people do not track their money because the tools feel like work.
              </p>
            </Scrub>
            <Scrub from={{ y: -50, scale: 0.95 }} offset={['start end', 'center 0.7']}>
              <p>
                So CashWell keeps it light. Log a transaction in a few taps, give each category a monthly budget, and the
                dashboard shows where you stand: what came in, what went out, and where it went.
              </p>
            </Scrub>
          </div>
        </div>
      </section>

      {/* values: three coloured panels */}
      <section className="mx-auto max-w-6xl px-6 pb-28 pt-4 md:pl-28 md:pb-36">
        <Scrub from={{ scale: 1.35, y: 60 }} offset={['start end', 'start 0.55']} className="text-center">
          <h2 className={bigHeading}>
            What we <em className="not-italic text-brand-600">care about.</em>
          </h2>
        </Scrub>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {values.map(({ icon: Icon, title, text }, i) => (
            <Scrub key={title} from={poses3[i]} offset={['start end', 'start 0.75']}>
              <div className={`group h-full min-h-[240px] p-7 shadow-[-6px_12px_34px_rgba(5,40,10,0.28)] ${tones[i].card}`}>
                <span className={`grid size-12 place-items-center transition duration-300 group-hover:scale-110 ${tones[i].tile}`}>
                  <AnimatedIcon icon={Icon} className="size-6" strokeWidth={1.75} delay={0.25 + i * 0.1} />
                </span>
                <h3 className="mt-5 text-xl font-extrabold">{title}</h3>
                <p className="mt-2 leading-7 opacity-80">{text}</p>
              </div>
            </Scrub>
          ))}
        </div>
      </section>

      {/* the dark sheet spreads out to the edges, holding the tech stack and the call to action */}
      <SpreadSheet className="bg-brand-900 text-white" inset="4%" radius={56} offset={['start end', 'start 0.3']}>
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-24 md:pl-28 md:pt-32">
          <Scrub from={{ scale: 1.25, rotateX: -14, y: 80 }} offset={['start end', 'start 0.25']}>
            <div className="bg-[#0a4a12] px-6 py-12 shadow-[0_30px_70px_rgba(0,0,0,0.35)] md:px-12 md:py-16">
              <div className="text-center">
                <p className={eyebrowDark}>Built with</p>
                <h2 className={`${bigHeading} mt-5 text-white`}>
                  A full stack, <em className="block not-italic text-accent-400">built by hand.</em>
                </h2>
              </div>
              {/* each tech is a tag hanging on a string; they slide in from alternating sides with a little tilt */}
              <div className="mt-12 grid gap-x-6 gap-y-8 sm:grid-cols-2">
                {stack.map((s, i) => (
                  <Scrub
                    key={s.name}
                    from={{ x: i % 2 ? 110 : -110, y: 70, rotateZ: i % 2 ? 7 : -7 }}
                    offset={['start end', 'center 0.85']}
                  >
                    <span aria-hidden className="mx-auto block h-7 w-px bg-white/30" />
                    <div className="drop-shadow-[0_8px_10px_rgba(0,0,0,0.3)]">
                      <div
                        className="relative flex h-full gap-4 bg-white px-5 pb-5 pt-9 text-ink"
                        style={{ clipPath: 'polygon(22px 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%, 0 22px)' }}
                      >
                        <span aria-hidden className="absolute left-1/2 top-3 size-3 -translate-x-1/2 rounded-full bg-[#0a4a12] ring-2 ring-white/40" />
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                          <AnimatedIcon icon={Check} className="size-4" strokeWidth={3} delay={0.25 + (i % 2) * 0.1} />
                        </span>
                        <div>
                          <h3 className="font-extrabold">{s.name}</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-600">{s.why}</p>
                        </div>
                      </div>
                    </div>
                  </Scrub>
                ))}
              </div>
            </div>
          </Scrub>
        </section>

        {/* call to action */}
        <section className="mx-auto max-w-6xl px-6 pb-28 pt-16 text-center md:px-28">
          <Scrub from={{ scale: 1.2, y: 50 }} offset={['start end', 'start 0.6']}>
            <h2 className={`${bigHeading} text-white`}>
              Give it <em className="not-italic text-accent-400">a try.</em>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-white/80">Create an account, or open the demo from the login page.</p>
            <Link
              to="/login"
              className="mt-8 inline-flex items-center gap-2 rounded-[18px] bg-accent-400 px-8 py-4 text-sm font-bold uppercase tracking-wider text-brand-900 shadow-[0_3px_0_0_var(--color-accent-600)] transition hover:bg-accent-500 active:translate-y-[3px] active:shadow-none"
            >
              Login / Sign up <ArrowRight className="size-4" />
            </Link>
          </Scrub>
        </section>
      </SpreadSheet>
    </div>
  )
}
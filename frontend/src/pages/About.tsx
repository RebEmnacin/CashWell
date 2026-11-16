import { ArrowRight, Check, Eye, Feather, Lock, type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import AnimatedIcon from '../components/AnimatedIcon'
import ReceiptPrinter from '../components/ReceiptPrinter'
import Scrub from '../components/Scrub'
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
      <section className="pt-6">
       <Scrub from={{ scale: 0.9, rotateX: -12, y: 70 }} offset={['start end', 'start 0.3']}>
       <SpreadSheet className="bg-white shadow-sm ring-1 ring-slate-200/70">
       <div className="mx-auto grid max-w-6xl gap-10  px-6 md:pl-28 py-16 md:py-20 lg:grid-cols-[1fr_2fr]">
        <Scrub from={{ x: -50, rotateY: 42, scale: 1.25 }} offset={['start end', 'start 0.55']}>
          <h2 className="text-3xl font-extrabold leading-tight text-brand-600">Why CashWell exists</h2>
          <span className="mt-4 block h-1 w-12 bg-accent-400" />
        </Scrub>
        <div className="space-y-5 text-lg leading-8 text-slate-600">
         <Scrub from={{ x: 50, rotateY: -22, y: 40 }} offset={['start end', 'center 0.7']}>
          <p>
            CashWell is a personal finance tracker built as a full-stack portfolio project. The idea is simple: most
            people do not track their money because the tools feel like work.
          </p>
         </Scrub>
         <Scrub from={{ x: 50, rotateY: -22, y: 60 }} offset={['start end', 'center 0.7']}>
          <p>
            So CashWell keeps it light. Log a transaction in a few taps, give each category a monthly budget, and the
            dashboard shows where you stand: what came in, what went out, and where it went.
          </p>
         </Scrub>
        </div>
       </div>
       </SpreadSheet>
       </Scrub>
      </section>

      {/* values */}
      <section className="pt-6">
       <Scrub from={{ scale: 0.8, rotateX: 18, y: 90 }} offset={['start end', 'start 0.3']}>
       <SpreadSheet className="bg-accent-50">
        <div className="mx-auto max-w-6xl px-6 py-16 md:pl-28 md:py-20">
          <Scrub from={{ scale: 1.6, y: 70 }} offset={['start end', 'start 0.55']} className="text-center">
            <h2 className="text-3xl font-extrabold text-ink">What we care about</h2>
          </Scrub>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {values.map(({ icon: Icon, title, text }, i) => (
              <Scrub key={title} from={{ y: 150, rotateX: 40, rotateZ: (i - 1) * 6, scale: 0.8 }}>
                <div className="group h-full rounded-none bg-white p-8 text-center shadow-md ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <span className="mx-auto grid size-32 place-items-center rounded-full bg-brand-50 ring-1 ring-brand-100 transition duration-300 group-hover:scale-105">
                    <span className="grid size-24 place-items-center rounded-full bg-brand-600 text-white shadow-lg">
                      <AnimatedIcon icon={Icon} className="size-12" strokeWidth={1.75} delay={0.25 + i * 0.1} />
                    </span>
                  </span>
                  <h3 className="mt-6 text-xl font-extrabold text-ink">{title}</h3>
                  <span className="mx-auto mt-3 block h-1 w-8 bg-accent-400 transition-all duration-300 group-hover:w-14" />
                  <p className="mt-3 leading-7 text-slate-600">{text}</p>
                </div>
              </Scrub>
            ))}
          </div>
        </div>
       </SpreadSheet>
       </Scrub>
      </section>

      {/* tech stack */}
      <section className="pt-6">
       <Scrub from={{ scale: 0.86, rotateZ: 2.5, y: 110 }} offset={['start end', 'start 0.3']}>
       <SpreadSheet className="bg-brand-600 text-white">
       <div className="mx-auto grid max-w-6xl gap-10  px-6 py-16 md:pl-28 md:py-20 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <Scrub from={{ x: -50, rotateY: 42, scale: 1.25 }} offset={['start end', 'start 0.55']}>
          <h2 className="text-3xl font-extrabold md:text-4xl">What it's built with</h2>
          <p className="mt-3 max-w-sm text-white/80">Tech Stack used for development</p>
        </Scrub>
        {/* each tech hangs on a string like a price tag and swings into place as you scroll */}
        <div className="grid gap-x-5 gap-y-8 pt-2 sm:grid-cols-2">
          {stack.map((s, i) => (
            <Scrub
              key={s.name}
              from={{ y: -120, rotateZ: i % 2 ? 20 : -20, rotateX: -16, scale: 0.9 }}
              offset={['start end', `start ${0.78 - (i % 2) * 0.08}`]}
              className="origin-top"
            >
              {/* the string */}
              <span aria-hidden className="mx-auto block h-7 w-px bg-white/60" />
              {/* the tag: sharp corners, the top two corners cut off, with a punched hole for the string */}
              <div className="drop-shadow-[0_8px_10px_rgba(15,40,35,0.16)]">
                <div
                  className="relative flex h-full gap-4 bg-white px-5 pb-5 pt-9"
                  style={{ clipPath: 'polygon(22px 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%, 0 22px)' }}
                >
                  <span aria-hidden className="absolute left-1/2 top-3 size-3 -translate-x-1/2 rounded-full bg-brand-600 ring-2 ring-slate-300" />
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                    <AnimatedIcon icon={Check} className="size-4" strokeWidth={3} delay={0.25 + (i % 2) * 0.1} />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-ink">{s.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{s.why}</p>
                  </div>
                </div>
              </div>
            </Scrub>
          ))}
        </div>
       </div>
       </SpreadSheet>
       </Scrub>
      </section>

      {/* CTA */}
      <section className="pb-3 pt-6 md:pb-6">
       <Scrub from={{ scale: 0.86, y: 80 }} offset={['start end', 'start 0.75']}>
       <SpreadSheet className="bg-brand-900 text-white">
        <Scrub from={{ scale: 0.7, y: 90, rotateX: 28 }} className="mx-auto max-w-6xl px-6 md:px-28 py-16 text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">Give it a try</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">Create an account, or open the demo from the login page.</p>
          <Link
            to="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent-400 px-8 py-4 text-sm font-bold uppercase tracking-wider text-brand-900 shadow-[0_3px_0_0_var(--color-accent-600)] transition hover:bg-accent-500 active:translate-y-[3px] active:shadow-none"
          >
            Login / Sign up <ArrowRight className="size-4" />
          </Link>
        </Scrub>
       </SpreadSheet>
       </Scrub>
      </section>
    </div>
  )
}
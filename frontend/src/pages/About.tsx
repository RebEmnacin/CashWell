import { ArrowRight, Check, Eye, Feather, Lock, type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

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

export default function About() {
  return (
    <>
      {/* header band */}
      <section className="relative overflow-hidden bg-linear-to-br from-brand-900 via-brand-900 to-brand-700 text-white">
        <div className="pointer-events-none absolute -right-32 -top-40 size-[460px] rounded-full border-[64px] border-white/[0.05]" />
        <div className="pointer-events-none absolute -bottom-56 left-[30%] size-[520px] rounded-full border-[64px] border-white/[0.04]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-8 md:pl-28 md:pb-24">
          {/* brand mark, top left (same as the home page) */}
          <div className="flex items-center gap-3">
            <img src="/CashWell_Logo.png" alt="" className="size-9 object-contain" />
            <span className="text-lg font-extrabold tracking-tight">CashWell</span>
          </div>

          <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1fr_300px]">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-sm font-bold uppercase tracking-[0.2em] text-brand-400"
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
            <motion.img
              src="/CashWell_Logo.png"
              alt="CashWell logo"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="mx-auto hidden w-60 object-contain drop-shadow-2xl lg:block"
            />
          </div>
        </div>
      </section>

      {/* story */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 md:pl-28 py-16 md:py-20 lg:grid-cols-[1fr_2fr]">
        <Reveal>
          <h2 className="text-3xl font-extrabold leading-tight text-brand-600">Why CashWell exists</h2>
        </Reveal>
        <Reveal delay={0.1} className="space-y-5 text-lg leading-8 text-slate-600">
          <p>
            CashWell is a personal finance tracker built as a full-stack portfolio project. The idea is simple: most
            people do not track their money because the tools feel like work.
          </p>
          <p>
            So CashWell keeps it light. Log a transaction in a few taps, give each category a monthly budget, and the
            dashboard shows where you stand: what came in, what went out, and where it went.
          </p>
        </Reveal>
      </section>

      {/* values */}
      <section className="bg-brand-50">
        <div className="mx-auto max-w-6xl px-6 py-16 md:pl-28 md:py-20">
          <Reveal className="text-center">
            <h2 className="text-3xl font-extrabold text-ink">What we care about</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {values.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.1}>
                <div className="group h-full rounded-[1.75rem] bg-white p-8 text-center shadow-md ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <span className="mx-auto grid size-32 place-items-center rounded-full bg-brand-50 ring-1 ring-brand-100 transition duration-300 group-hover:scale-105">
                    <span className="grid size-24 place-items-center rounded-full bg-brand-600 text-white shadow-lg">
                      <Icon className="size-12" strokeWidth={1.75} />
                    </span>
                  </span>
                  <h3 className="mt-6 text-xl font-extrabold text-ink">{title}</h3>
                  <p className="mt-2 leading-7 text-slate-600">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* tech stack */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:pl-28 md:py-20 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <Reveal>
          <h2 className="text-3xl font-extrabold text-ink md:text-4xl">What it's built with</h2>
          <p className="mt-3 max-w-sm text-slate-600">And a one-line reason for each choice.</p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          {stack.map((s, i) => (
            <Reveal key={s.name} delay={(i % 2) * 0.08}>
              <div className="flex h-full gap-4 rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                  <Check className="size-4" strokeWidth={3} />
                </span>
                <div>
                  <h3 className="font-extrabold text-ink">{s.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{s.why}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-900 text-white">
        <Reveal className="mx-auto max-w-6xl px-6 md:px-28 py-16 text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">Give it a try</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">Create an account, or open the demo from the login page.</p>
          <Link
            to="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold uppercase tracking-wider text-brand-900 transition hover:bg-brand-50 active:scale-95"
          >
            Login / Sign up <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </section>
    </>
  )
}
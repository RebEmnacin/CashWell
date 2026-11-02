import { Home, Info, LogIn, TrendingUp, type LucideIcon } from 'lucide-react'
import { MotionConfig, motion } from 'motion/react'
import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

// The three public pages. ICONS ONLY: the label is just a tooltip + screen-reader text.
const tabs: { to: string; label: string; icon: LucideIcon; end: boolean }[] = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/login', label: 'Login / Sign up', icon: LogIn, end: false },
  { to: '/about', label: 'About us', icon: Info, end: false },
]

/** One icon button. The green circle behind the active icon slides between tabs (shared layoutId). */
function Tab({ to, label, icon: Icon, end, group }: (typeof tabs)[number] & { group: string }) {
  return (
    <NavLink to={to} end={end} aria-label={label} title={label} className="group relative grid size-12 place-items-center">
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId={`active-${group}`}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="absolute inset-0 rounded-full bg-brand-500"
            />
          )}
          <Icon
            className={`relative z-10 size-5 transition-colors ${
              isActive ? 'text-white' : 'text-emerald-100/70 group-hover:text-white'
            }`}
          />
        </>
      )}
    </NavLink>
  )
}

export default function PublicLayout() {
  const { pathname } = useLocation()

  // every time you change page, start from the top
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <MotionConfig reducedMotion="never">
      <div className="min-h-screen bg-[#f6f8f7]">
        {/* Desktop: slim icon rail */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-20 flex-col items-center border-r border-white/10 bg-brand-900 md:flex">
          <div className="flex h-20 shrink-0 items-center justify-center" title="CashWell">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-500 text-white">
              <TrendingUp className="size-5" strokeWidth={2.5} />
            </span>
          </div>
          <nav className="mt-2 flex flex-col gap-3">
            {tabs.map((t) => (
              <Tab key={t.to} {...t} group="desktop" />
            ))}
          </nav>
        </aside>

        {/* Phone: the same icons along the bottom */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-white/10 bg-brand-900 py-2 md:hidden">
          {tabs.map((t) => (
            <Tab key={t.to} {...t} group="mobile" />
          ))}
        </nav>

        <main className="min-h-screen pb-[72px] md:pb-0 md:pl-20">
          <Outlet />
        </main>
      </div>
    </MotionConfig>
  )
}

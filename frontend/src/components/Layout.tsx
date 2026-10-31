import { LayoutDashboard, LogOut, PiggyBank, ReceiptText, TrendingUp } from 'lucide-react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: ReceiptText, end: false },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank, end: false },
]

// Springy movement used by the logout arrow
const spring = 'transition-transform duration-300 ease-[cubic-bezier(0.3,1.6,0.5,1)]'

/**
 * The light notch cut into the rail PLUS the green circle inside it, moving as ONE object.
 * Every active tab renders one, but they all share layoutId="pocket", so Motion slides it
 * from the old tab to the new one.
 */
function Pocket() {
  return (
    <motion.span
      layoutId="pocket"
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      className="pointer-events-none absolute inset-0"
    >
      <span className="absolute inset-y-0.5 left-[10px] right-0 rounded-l-full bg-[#f6f8f7]" />
      <span className="absolute -top-3 right-0 size-3.5 bg-[radial-gradient(circle_at_0_0,transparent_14px,#f6f8f7_14.5px)]" />
      <span className="absolute -bottom-3 right-0 size-3.5 bg-[radial-gradient(circle_at_0_100%,transparent_14px,#f6f8f7_14.5px)]" />
      {/* the green circle that carries the icon */}
      <span className="absolute left-4 top-1/2 size-12 -translate-y-1/2 rounded-full bg-brand-600" />
    </motion.span>
  )
}

/**
 * One tab in the rail.
 * Order of events when you press it:
 *  1. the old tab's label snaps shut (fast, no fade)
 *  2. the pocket + green circle slide to this tab
 *  3. once it has arrived, this tab's label stretches out to the right
 */
function NavTab({ to, end = false, label, icon }: { to: string; end?: boolean; label: string; icon: ReactNode }) {
  return (
    <NavLink to={to} end={end} aria-label={label} title={label} className="group/item relative block h-16 shrink-0">
      {({ isActive }) => (
        <>
          {isActive && <Pocket />}

          <AnimatePresence initial={false}>
            {isActive && (
              <motion.span
                key="label"
                initial={{ width: 0 }}
                animate={{ width: 'auto', transition: { type: 'spring', stiffness: 420, damping: 36, delay: 0.18 } }}
                exit={{ width: 0, transition: { duration: 0.12, ease: 'easeIn' } }}
                className="absolute left-[40px] top-1/2 h-12 -translate-y-1/2 overflow-hidden rounded-r-full bg-brand-600"
              >
                <span className="flex h-full items-center whitespace-nowrap pl-6 pr-5 text-sm font-semibold text-white">
                  {label}
                </span>
              </motion.span>
            )}
          </AnimatePresence>

          {/* the icon sits on top and just changes color, no movement */}
          <span
            className={`absolute left-4 top-1/2 grid size-12 -translate-y-1/2 place-items-center ${
              isActive ? 'text-white' : 'text-emerald-100/70 group-hover/item:text-white'
            }`}
          >
            {icon}
          </span>
        </>
      )}
    </NavLink>
  )
}

/** The Log out button: a circle that stretches into a pill on hover (it is not a page, so no pocket). */
function HoverPill({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="absolute left-4 top-1/2 flex h-12 max-w-12 -translate-y-1/2 items-center overflow-hidden rounded-full bg-transparent text-emerald-100/70 transition-[max-width,background-color] duration-300 ease-out group-hover/item:max-w-64 group-hover/item:bg-brand-600 group-hover/item:text-white">
      <span className="grid size-12 shrink-0 place-items-center">{icon}</span>
      <span className="whitespace-nowrap pr-5 text-sm font-semibold opacity-0 transition-opacity duration-200 group-hover/item:opacity-100 group-hover/item:delay-100">
        {children}
      </span>
    </span>
  )
}

export default function Layout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <MotionConfig reducedMotion="never">
      <div className="min-h-screen md:flex">
        {/* Sidebar (desktop): slim icon rail, the pocket slides to the active tab */}
        <div className="hidden w-44 shrink-0 md:block" aria-hidden="true" />
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-20 flex-col bg-brand-900 text-white md:flex">
          {/* Logo */}
          <div className="flex h-20 shrink-0 items-center justify-center" title="CashWell">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-500">
              <TrendingUp className="size-5" strokeWidth={2.5} />
            </span>
          </div>

          {/* Tabs */}
          <nav className="flex flex-1 flex-col gap-1">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavTab key={to} to={to} end={end} label={label} icon={<Icon className="size-5" />} />
            ))}
          </nav>

          {/* Account + logout */}
          <div className="shrink-0 border-t border-white/10 py-2">
            <NavTab
              to="/account"
              label="Account"
              icon={
                <span className="grid size-9 place-items-center rounded-full bg-brand-500 text-sm font-extrabold text-white">
                  {user?.name?.[0]?.toUpperCase()}
                </span>
              }
            />
            <button onClick={handleLogout} aria-label="Log out" className="group/item relative block h-14 w-full cursor-pointer">
              <HoverPill icon={<LogOut className={`size-5 ${spring} group-hover/item:translate-x-1`} />}>Log out</HoverPill>
            </button>
          </div>
        </aside>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-brand-900 px-4 py-3 text-white md:hidden">
          <div className="flex items-center gap-2 font-extrabold">
            <TrendingUp className="size-5 text-brand-500" strokeWidth={2.5} /> CashWell
          </div>
          <button onClick={handleLogout} aria-label="Log out" className="cursor-pointer rounded-lg p-2 hover:bg-white/10">
            <LogOut className="size-4" />
          </button>
        </header>

        <main className="min-w-0 flex-1 px-4 pb-28 pt-6 md:pl-6 md:pr-10 md:pb-10 md:pt-9">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>

        {/* Mobile bottom tabs */}
        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${
                  isActive ? 'text-brand-600' : 'text-slate-400'
                }`
              }
            >
              <Icon className="size-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </MotionConfig>
  )
}
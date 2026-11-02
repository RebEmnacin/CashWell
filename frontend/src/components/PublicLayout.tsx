import { Home, Info, LogIn, TrendingUp, type LucideIcon } from 'lucide-react'
import { MotionConfig, motion } from 'motion/react'
import { useEffect, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

// The three public pages
const tabs: { to: string; label: string; icon: LucideIcon; end: boolean }[] = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/login', label: 'Login / Sign up', icon: LogIn, end: false },
  { to: '/about', label: 'About us', icon: Info, end: false },
]

/**
 * The light notch cut into the rail, the label pill and the green circle, all moving as ONE object.
 * (Same design as the sidebar inside the app.) Every active tab renders one, but they all share
 * layoutId="public-pocket", so Motion slides it from the old tab to the new one.
 */
function Pocket({ label }: { label: string }) {
  return (
    <motion.span
      layoutId="public-pocket"
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      className="pointer-events-none absolute inset-0"
    >
      <span className="absolute inset-y-0.5 left-[10px] right-0 rounded-l-full bg-[#f6f8f7]" />
      <span className="absolute -top-3 right-0 size-3.5 bg-[radial-gradient(circle_at_0_0,transparent_14px,#f6f8f7_14.5px)]" />
      <span className="absolute -bottom-3 right-0 size-3.5 bg-[radial-gradient(circle_at_0_100%,transparent_14px,#f6f8f7_14.5px)]" />

      {/* Label window: hides everything left of the circle's centre line */}
      <span className="absolute left-[40px] top-1/2 h-12 -translate-y-1/2 overflow-hidden">
        {/* the finished pill slides out from behind the circle once the pocket has arrived */}
        <motion.span
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          transition={{ duration: 0.28, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-12 items-center whitespace-nowrap rounded-r-full bg-brand-600 pl-6 pr-5 text-sm font-semibold text-white"
        >
          {label}
        </motion.span>
      </span>

      {/* the green circle that carries the icon (sits on top of the label) */}
      <span className="absolute left-4 top-1/2 size-12 -translate-y-1/2 rounded-full bg-brand-600" />
    </motion.span>
  )
}

/** One tab in the desktop rail. Only the ACTIVE tab shows the circle + label; the rest are plain icons. */
function RailTab({ to, end, label, icon }: { to: string; end: boolean; label: string; icon: ReactNode }) {
  return (
    <NavLink to={to} end={end} aria-label={label} title={label} className="group/item relative block h-16 shrink-0">
      {({ isActive }) => (
        <>
          {isActive && <Pocket label={label} />}
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

/** Phone: just circles along the bottom. */
function MobileTab({ to, end, label, icon: Icon }: (typeof tabs)[number]) {
  return (
    <NavLink to={to} end={end} aria-label={label} title={label} className="relative grid size-12 place-items-center">
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="public-mobile-dot"
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="absolute inset-0 rounded-full bg-brand-500"
            />
          )}
          <Icon className={`relative z-10 size-5 ${isActive ? 'text-white' : 'text-emerald-100/70'}`} />
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
        {/* Desktop: slim icon rail, the pocket slides to the active tab */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-20 flex-col bg-brand-900 text-white md:flex">
          <div className="flex h-20 shrink-0 items-center justify-center" title="CashWell">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-500">
              <TrendingUp className="size-5" strokeWidth={2.5} />
            </span>
          </div>
          <nav className="flex flex-col gap-1">
            {tabs.map(({ to, label, icon: Icon, end }) => (
              <RailTab key={to} to={to} end={end} label={label} icon={<Icon className="size-5" />} />
            ))}
          </nav>
        </aside>

        {/* Phone: the same icons along the bottom */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around bg-brand-900 py-2 md:hidden">
          {tabs.map((t) => (
            <MobileTab key={t.to} {...t} />
          ))}
        </nav>

        {/* md:pl-44 leaves the light gutter the label pill slides out into */}
        <main className="min-h-screen pb-[72px] md:pb-0 md:pl-44">
          <Outlet />
        </main>
      </div>
    </MotionConfig>
  )
}
import { Home, Info, LogIn, type LucideIcon } from 'lucide-react'
import { MotionConfig, motion } from 'motion/react'
import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

// The three public pages
const tabs: { to: string; label: string; icon: LucideIcon; end: boolean }[] = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/login', label: 'Login / Sign up', icon: LogIn, end: false },
  { to: '/about', label: 'About us', icon: Info, end: false },
]

/**
 * One floating tab.
 *  - not pressed: just a circle with an icon
 *  - pressed: the circle turns bright green and a pill with the label slides out from behind it
 */
function Tab({ to, end, label, icon: Icon }: (typeof tabs)[number]) {
  return (
    <NavLink to={to} end={end} aria-label={label} title={label} className="group relative block size-14 shrink-0">
      {({ isActive }) => (
        <>
          {/* label window: hides everything left of the circle's centre, so the pill appears to come out from behind it */}
          {isActive && (
            <span className="absolute left-7 top-0 hidden h-14 overflow-hidden md:block">
              <motion.span
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                transition={{ duration: 0.3, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="flex h-14 items-center whitespace-nowrap rounded-r-full bg-brand-600 pl-9 pr-7 text-[15px] font-semibold text-white"
              >
                {label}
              </motion.span>
            </span>
          )}

          {/* the circle (always on top) */}
          <span
            className={`absolute inset-0 grid place-items-center rounded-full shadow-lg transition-colors duration-200 ${
              isActive
                ? 'bg-brand-600 text-white'
                : 'bg-brand-900 text-white/85 ring-1 ring-white/30 group-hover:bg-brand-700 group-hover:text-white'
            }`}
          >
            <Icon className="size-6" />
          </span>
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
        {/* Desktop: floating circles, vertically centered on the left. No bar, no logo. */}
        <nav className="fixed left-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-5 md:flex">
          {tabs.map((t) => (
            <Tab key={t.to} {...t} />
          ))}
        </nav>

        {/* Phone: the same circles floating at the bottom centre */}
        <nav className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-5 md:hidden">
          {tabs.map((t) => (
            <Tab key={t.to} {...t} />
          ))}
        </nav>

        {/* md:pl-52 keeps a light strip on the left for the circles and the pill that slides out */}
        <main className="min-h-screen pb-24 md:pb-0 md:pl-52">
          <Outlet />
        </main>
      </div>
    </MotionConfig>
  )
}
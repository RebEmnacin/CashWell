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
 * One floating tab, drawn on a layer ABOVE the page.
 *  - not pressed: a white circle with a green icon (readable on both dark and light sections)
 *  - pressed: the circle turns green, gets a white outline, and a pill with the label slides out from behind it
 */
function Tab({ to, end, label, icon: Icon }: (typeof tabs)[number]) {
  return (
    <NavLink to={to} end={end} aria-label={label} title={label} className="group relative block size-14 shrink-0">
      {({ isActive }) => (
        <>
          {/* the pill. The outer span gives it a shadow, the inner "window" hides everything left of the
              circle's centre so the pill looks like it comes out from behind the circle. */}
          {isActive && (
            <span className="pointer-events-none absolute left-7 top-1/2 hidden -translate-y-1/2 drop-shadow-lg md:block">
              <span className="block h-16 overflow-hidden">
                <motion.span
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="flex h-16 items-center whitespace-nowrap rounded-r-full border-4 border-l-0 border-white bg-white pl-9 pr-7 text-[15px] font-semibold text-brand-700"
                >
                  {label}
                </motion.span>
              </span>
            </span>
          )}

          {/* the circle (always on top) */}
          <span
            className={`absolute inset-0 grid place-items-center rounded-full shadow-lg transition-colors duration-200 ${
              isActive
                ? 'bg-brand-600 text-white ring-4 ring-white'
                : 'bg-white text-brand-700 group-hover:bg-brand-50'
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
        {/* The tabs are a floating layer above the page. Desktop: vertically centered on the left. */}
        <nav className="fixed left-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-5 md:flex">
          {tabs.map((t) => (
            <Tab key={t.to} {...t} />
          ))}
        </nav>

        {/* Phone: the same circles floating at the bottom centre */}
        <nav className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-5 md:hidden">
          {tabs.map((t) => (
            <Tab key={t.to} {...t} />
          ))}
        </nav>

        {/* No side padding: every section runs edge to edge and the tabs float on top of it */}
        <main className="min-h-screen pb-24 md:pb-0">
          <Outlet />
        </main>
      </div>
    </MotionConfig>
  )
}

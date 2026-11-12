import { Home, Info, LogIn, Menu, X, type LucideIcon } from 'lucide-react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useEffect, useState } from 'react'
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
 *  - pressed: the circle turns green, gets a white outline, and a plain white pill with the label slides out from behind it
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
                  className="flex h-16 items-center whitespace-nowrap rounded-r-full bg-white pl-9 pr-7 text-[15px] font-semibold text-brand-700"
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

/**
 * PHONE ONLY: a round hamburger button floating at the top right.
 * Tapping it opens a full-screen overlay with the three pages. Hidden from `md` up (desktop keeps the circle tabs).
 */
function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  // close when you go to another page
  useEffect(() => setOpen(false), [pathname])

  // Escape closes it, and the page behind can't scroll while it's open
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="fixed right-4 top-4 z-[70] grid size-12 cursor-pointer place-items-center rounded-full bg-white text-brand-700 shadow-lg ring-1 ring-black/5 transition active:scale-95"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? 'x' : 'menu'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid place-items-center"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </motion.span>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex flex-col justify-center bg-brand-900/97 px-8 backdrop-blur-sm"
          >
            {tabs.map(({ to, end, label, icon: Icon }, i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-4 border-b border-white/15 py-5 text-2xl font-extrabold transition-colors ${
                      isActive ? 'text-white' : 'text-white/60'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`grid size-12 shrink-0 place-items-center rounded-full ${
                          isActive ? 'bg-white text-brand-700' : 'bg-white/10 text-white'
                        }`}
                      >
                        <Icon className="size-6" />
                      </span>
                      {label}
                    </>
                  )}
                </NavLink>
              </motion.div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
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

        {/* Phone: hamburger button at the top right that opens a full-screen menu */}
        <MobileMenu />

        {/* No side padding: every section runs edge to edge and the tabs float on top of it */}
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </MotionConfig>
  )
}
import { LayoutDashboard, LogOut, PiggyBank, ReceiptText, TrendingUp } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: ReceiptText, end: false },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank, end: false },
]

export default function Layout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar (desktop) */}
            {/* Sidebar (desktop): icon rail that expands on hover */}
      <div className="hidden w-20 shrink-0 md:block" aria-hidden="true" />
      <aside className="group/side fixed inset-y-0 left-0 z-30 hidden w-20 flex-col overflow-hidden bg-brand-900 text-white transition-[width] duration-300 ease-out hover:w-60 focus-within:w-60 md:flex">
        {/* Logo */}
        <div className="relative h-20 shrink-0">
          <span className="absolute left-[22px] top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-xl bg-brand-500">
            <TrendingUp className="size-5" strokeWidth={2.5} />
          </span>
          <span className="absolute left-[70px] top-1/2 -translate-y-1/2 whitespace-nowrap text-lg font-extrabold tracking-tight opacity-0 transition-opacity duration-200 group-hover/side:opacity-100 group-focus-within/side:opacity-100">
            CashWell
          </span>
        </div>

        {/* Tabs */}
        <nav className="flex flex-1 flex-col gap-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} aria-label={label} className="group/item relative block h-16 shrink-0">
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <>
                      {/* light pocket carved into the panel, running out to the right edge */}
                      <span className="absolute inset-y-0.5 left-[10px] right-0 rounded-l-full bg-[#f6f8f7]" />
                      {/* smooth the two corners where the pocket meets the edge */}
                      <span className="absolute -top-3 right-0 size-3.5 bg-[radial-gradient(circle_at_0_0,transparent_14px,#f6f8f7_14.5px)]" />
                      <span className="absolute -bottom-3 right-0 size-3.5 bg-[radial-gradient(circle_at_0_100%,transparent_14px,#f6f8f7_14.5px)]" />
                      {/* the colored bubble that holds the active icon */}
                      <span className="absolute left-[16px] top-1/2 grid size-12 -translate-y-1/2 animate-pop place-items-center rounded-full bg-brand-500 text-white">
                        <Icon className="size-5" />
                      </span>
                    </>
                  ) : (
                    <Icon className="absolute left-[30px] top-1/2 size-5 -translate-y-1/2 text-emerald-100/70 transition group-hover/item:text-white" />
                  )}
                  <span
                    className={`absolute left-[88px] top-1/2 -translate-y-1/2 whitespace-nowrap text-sm opacity-0 transition-opacity duration-200 group-hover/side:opacity-100 group-focus-within/side:opacity-100 ${
                      isActive ? 'font-extrabold text-brand-600' : 'font-semibold text-emerald-100/70 group-hover/item:text-white'
                    }`}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="shrink-0 border-t border-white/10 py-2">
          <div className="relative h-14">
            <span className="absolute left-[22px] top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-brand-500 text-sm font-extrabold">
              {user?.name?.[0]?.toUpperCase()}
            </span>
            <div className="absolute left-[70px] top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/side:opacity-100 group-focus-within/side:opacity-100">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-emerald-100/60">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Log out"
            className="relative block h-14 w-full cursor-pointer text-left text-emerald-100/70 transition hover:text-white"
          >
            <LogOut className="absolute left-[30px] top-1/2 size-5 -translate-y-1/2" />
            <span className="absolute left-[88px] top-1/2 -translate-y-1/2 whitespace-nowrap text-sm font-semibold opacity-0 transition-opacity duration-200 group-hover/side:opacity-100 group-focus-within/side:opacity-100">
              Log out
            </span>
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

      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 md:px-10 md:pb-10 md:pt-9">
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
  )
}

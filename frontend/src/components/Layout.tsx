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
      <aside className="sticky top-0 z-20 hidden h-screen w-56 shrink-0 flex-col bg-brand-900 py-5 text-white md:flex">
        <div className="mb-8 flex items-center gap-2.5 px-5">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-500">
            <TrendingUp className="size-5" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-extrabold tracking-tight">CashWell</span>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="group relative block">
              {({ isActive }) => (
                <>
                  <span
                    className={`flex items-center gap-3 px-5 py-3.5 text-sm font-semibold transition ${
                      isActive
                        ? 'text-white'
                        : 'text-emerald-100/70 group-hover:bg-white/8 group-hover:text-white'
                    }`}
                  >
                    {/* small icon hides on the active row because the bubble shows it instead */}
                    <Icon className={`size-[18px] ${isActive ? 'invisible' : ''}`} />
                    {label}
                  </span>

                  {isActive && (
                    <span className="absolute -right-6 top-1/2 grid size-12 -translate-y-1/2 animate-pop place-items-center rounded-full border-[6px] border-[#f6f8f7] bg-brand-500 text-white">
                      <Icon className="size-5" />
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-5 pt-4">
          <p className="truncate text-sm font-semibold">{user?.name}</p>
          <p className="truncate text-xs text-emerald-100/60">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-white/10 py-2 text-xs font-semibold transition hover:bg-white/20"
          >
            <LogOut className="size-3.5" /> Log out
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

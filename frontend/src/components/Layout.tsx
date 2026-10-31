import { LayoutDashboard, LogOut, PiggyBank, ReceiptText, TrendingUp } from 'lucide-react'
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
 * A circle (the icon) that stretches into a pill with the label when its row is hovered.
 * It sits inside a parent that has the class "group/item".
 */
function Pill({ icon, open = false, hoverOpen = true, children }: { icon: ReactNode; open?: boolean; hoverOpen?: boolean; children: ReactNode }) {
  return (
    <span
      className={`absolute left-4 top-1/2 flex h-12 -translate-y-1/2 items-center overflow-hidden rounded-full transition-[max-width,background-color,box-shadow] duration-300 ease-out ${
        open
          ? 'max-w-40 bg-brand-600 text-white shadow-lg'
          : hoverOpen
            ? 'max-w-12 bg-transparent text-emerald-100/70 group-hover/item:max-w-64 group-hover/item:bg-brand-600 group-hover/item:text-white group-hover/item:shadow-lg group-focus-visible/item:max-w-64'
            : 'max-w-12 bg-transparent text-emerald-100/70 group-hover/item:text-white'
      }`}
    >
      <span className="grid size-12 shrink-0 place-items-center">{icon}</span>
      <span
        className={`whitespace-nowrap pr-5 text-sm font-semibold transition-opacity duration-200 ${
          open ? 'opacity-100 delay-100' : hoverOpen ? 'opacity-0 group-hover/item:opacity-100 group-hover/item:delay-100' : 'opacity-0'
        }`}
      >
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
    <div className="min-h-screen md:flex">
      {/* Sidebar (desktop): slim icon rail, icons stretch into pills on hover */}
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
            <NavLink key={to} to={to} end={end} aria-label={label} title={label} className="group/item relative block h-16 shrink-0">
              {({ isActive }) => (
                <>
                  {isActive && (
                    <>
                      {/* light pocket carved into the panel, running out to the right edge */}
                      <span className="absolute inset-y-0.5 left-[10px] right-0 rounded-l-full bg-[#f6f8f7]" />
                      {/* smooth the two corners where the pocket meets the edge */}
                      <span className="absolute -top-3 right-0 size-3.5 bg-[radial-gradient(circle_at_0_0,transparent_14px,#f6f8f7_14.5px)]" />
                      <span className="absolute -bottom-3 right-0 size-3.5 bg-[radial-gradient(circle_at_0_100%,transparent_14px,#f6f8f7_14.5px)]" />
                    </>
                  )}
                  <Pill open={isActive} hoverOpen={false} icon={<Icon className="size-5" />}>
                    {label}
                  </Pill>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="shrink-0 border-t border-white/10 py-2">
          <NavLink to="/account" aria-label="Account" title="Account" className="group/item relative block h-16">
            {({ isActive }) => (
              <>
                {isActive && (
                  <>
                    {/* same carved pocket as the other tabs */}
                    <span className="absolute inset-y-0.5 left-[10px] right-0 rounded-l-full bg-[#f6f8f7]" />
                    <span className="absolute -top-3 right-0 size-3.5 bg-[radial-gradient(circle_at_0_0,transparent_14px,#f6f8f7_14.5px)]" />
                    <span className="absolute -bottom-3 right-0 size-3.5 bg-[radial-gradient(circle_at_0_100%,transparent_14px,#f6f8f7_14.5px)]" />
                  </>
                )}
                <Pill
                  open={isActive}
                  hoverOpen={false}
                  icon={
                    <span className="grid size-9 place-items-center rounded-full bg-brand-500 text-sm font-extrabold text-white">
                      {user?.name?.[0]?.toUpperCase()}
                    </span>
                  }
                >
                  Account
                </Pill>
              </>
            )}
          </NavLink>
          <button onClick={handleLogout} aria-label="Log out" className="group/item relative block h-14 w-full cursor-pointer">
            <Pill icon={<LogOut className={`size-5 ${spring} group-hover/item:translate-x-1`} />}>Log out</Pill>
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
  )
}

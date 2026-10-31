import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { CURRENCY } from '../lib/format'
import { useAuthStore } from '../store/authStore'

export default function Account() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <PageHeader title="Account" subtitle="Your profile and session" />

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card animate-rise lg:col-span-2">
          <div className="flex items-center gap-5">
            <span className="grid size-20 shrink-0 place-items-center rounded-full bg-brand-600 text-3xl font-extrabold text-white">
              {user?.name?.[0]?.toUpperCase()}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-extrabold">{user?.name}</h2>
              <p className="truncate text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>

          <dl className="mt-7 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="label">Name</dt>
              <dd className="font-semibold">{user?.name}</dd>
            </div>
            <div className="min-w-0">
              <dt className="label">Email</dt>
              <dd className="truncate font-semibold">{user?.email}</dd>
            </div>
            <div>
              <dt className="label">Currency</dt>
              <dd className="font-semibold">{CURRENCY}</dd>
            </div>
          </dl>
        </section>

        <section className="card animate-rise" style={{ animationDelay: '60ms' }}>
          <h2 className="font-extrabold">Session</h2>
          <p className="mt-1 text-sm text-slate-500">You are signed in on this device.</p>
          <button className="btn-ghost mt-5 w-full" onClick={handleLogout}>
            <LogOut className="size-4" /> Log out
          </button>
        </section>
      </div>
    </>
  )
}
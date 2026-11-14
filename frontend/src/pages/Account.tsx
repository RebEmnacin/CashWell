import { KeyRound, LogOut, Mail, Pencil, Settings, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { authApi } from '../api/endpoints'
import PageHeader from '../components/PageHeader'
import { CURRENCY } from '../lib/format'
import { useAuthStore } from '../store/authStore'

const iconBtn =
  'grid size-9 cursor-pointer place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-default disabled:opacity-50'
const errorBox = 'rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600'

/** A small centered dialog; Escape or a click on the dark area closes it. */
function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="card w-full max-w-md animate-rise p-6 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className={iconBtn}>
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function PasswordDialog({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [again, setAgain] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!current) return setError('Enter your current password')
    if (next.length < 6) return setError('Use at least 6 characters for the new password')
    if (next !== again) return setError('The new passwords do not match')
    setSaving(true)
    setError('')
    try {
      await authApi.changePassword(current, next)
      setDone(true)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog title="Change password" onClose={onClose}>
      {done ? (
        <>
          <p className="text-sm text-slate-600">Your password was updated.</p>
          <button type="button" className="btn-primary mt-5 w-full" onClick={onClose}>Done</button>
        </>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <div>
            <label htmlFor="pw-current" className="label">Current password</label>
            <input id="pw-current" type="password" className="input" autoComplete="current-password" autoFocus
              value={current} onChange={(e) => setCurrent(e.target.value)} />
          </div>
          <div>
            <label htmlFor="pw-new" className="label">New password</label>
            <input id="pw-new" type="password" className="input" autoComplete="new-password" placeholder="At least 6 characters"
              value={next} onChange={(e) => setNext(e.target.value)} />
          </div>
          <div>
            <label htmlFor="pw-again" className="label">Repeat new password</label>
            <input id="pw-again" type="password" className="input" autoComplete="new-password"
              value={again} onChange={(e) => setAgain(e.target.value)} />
          </div>
          {error && <p role="alert" className={errorBox}>{error}</p>}
          <div className="flex gap-2">
            <button type="button" className="btn-ghost flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Saving…' : 'Update password'}</button>
          </div>
        </form>
      )}
    </Dialog>
  )
}

function DeleteDialog({ onClose, onDeleted }: { onClose: () => void; onDeleted: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!password) return setError('Enter your password to confirm')
    setDeleting(true)
    setError('')
    try {
      await authApi.deleteAccount(password)
      onDeleted()
    } catch (err) {
      setError(errorMessage(err))
      setDeleting(false)
    }
  }

  return (
    <Dialog title="Delete account" onClose={onClose}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <p className="text-sm text-slate-600">
          This permanently deletes your account and all of your transactions, categories and budgets. It can't be undone.
        </p>
        <div>
          <label htmlFor="del-password" className="label">Password</label>
          <input id="del-password" type="password" className="input" autoComplete="current-password" autoFocus
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p role="alert" className={errorBox}>{error}</p>}
        <div className="flex gap-2">
          <button type="button" className="btn-ghost flex-1" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={deleting}
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60">
            <Trash2 className="size-4" /> {deleting ? 'Deleting…' : 'Delete my account'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}

export default function Account() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('') // current password, asked only when the email changes
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [menu, setMenu] = useState(false)
  const [dialog, setDialog] = useState<'password' | 'delete' | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  const emailChanged = editing && email.trim().toLowerCase() !== (user?.email ?? '')

  const startEdit = (focusEmail = false) => {
    setName(user?.name ?? '')
    setEmail(user?.email ?? '')
    setPassword('')
    setError('')
    setEditing(true)
    setMenu(false)
    if (focusEmail) setTimeout(() => emailRef.current?.focus(), 0)
  }
  const cancelEdit = () => {
    setEditing(false)
    setError('')
  }

  // close the settings menu when you click somewhere else
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('Enter your name')
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email')
    if (emailChanged && !password) return setError('Enter your current password to change your email')
    setSaving(true)
    setError('')
    try {
      const updated = await authApi.updateMe({
        name: name.trim(),
        email: email.trim(),
        ...(emailChanged ? { current_password: password } : {}),
      })
      setUser(updated)
      setEditing(false)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItem = 'flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold hover:bg-slate-50'

  return (
    <>
      <PageHeader title="Account"/>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card animate-rise lg:col-span-2">
          <form onSubmit={save} noValidate>
            <div className="flex items-start gap-5">
              <span className="grid size-20 shrink-0 place-items-center rounded-full bg-brand-600 text-3xl font-extrabold text-white">
                {(editing ? name : user?.name)?.trim()?.[0]?.toUpperCase()}
              </span>
              <div className="min-w-0 flex-1 pt-3">
                <h2 className="truncate text-xl font-extrabold">{user?.name}</h2>
                <p className="truncate text-sm text-slate-500">{user?.email}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" aria-label="Edit profile" title="Edit profile" aria-pressed={editing}
                  className={`${iconBtn} ${editing ? 'bg-accent-100 text-accent-700' : ''}`}
                  onClick={() => (editing ? cancelEdit() : startEdit())}>
                  <Pencil className="size-[18px]" />
                </button>
                <div ref={menuRef} className="relative">
                  <button type="button" aria-label="Settings" title="Settings" aria-haspopup="menu" aria-expanded={menu}
                    className={`${iconBtn} ${menu ? 'bg-slate-100 text-slate-800' : ''}`} onClick={() => setMenu((m) => !m)}>
                    <Settings className="size-[18px]" />
                  </button>
                  {menu && (
                    <div role="menu" className="absolute right-0 top-full z-30 mt-1 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                      <button role="menuitem" type="button" className={`${menuItem} text-slate-700`}
                        onClick={() => { setMenu(false); setDialog('password') }}>
                        <KeyRound className="size-4 text-slate-400" /> Edit password
                      </button>
                      <button role="menuitem" type="button" className={`${menuItem} text-slate-700`} onClick={() => startEdit(true)}>
                        <Mail className="size-4 text-slate-400" /> Update email
                      </button>
                      <button role="menuitem" type="button" className={`${menuItem} border-t border-slate-100 text-rose-600`}
                        onClick={() => { setMenu(false); setDialog('delete') }}>
                        <Trash2 className="size-4" /> Delete account
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <dl className="mt-7 grid gap-5 sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="label"><label htmlFor="acc-name">Name</label></dt>
                <dd>
                  {editing ? (
                    <input id="acc-name" className="input" value={name} maxLength={100} autoFocus={!emailChanged}
                      onChange={(e) => setName(e.target.value)} />
                  ) : (
                    <span className="block truncate font-semibold">{user?.name}</span>
                  )}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="label"><label htmlFor="acc-email">Email</label></dt>
                <dd>
                  {editing ? (
                    <input id="acc-email" ref={emailRef} type="email" className="input" value={email} autoComplete="email"
                      onChange={(e) => setEmail(e.target.value)} />
                  ) : (
                    <span className="block truncate font-semibold">{user?.email}</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="label">Currency</dt>
                <dd className="font-semibold">{CURRENCY}</dd>
              </div>
              {emailChanged && (
                <div className="min-w-0">
                  <dt className="label"><label htmlFor="acc-password">Current password</label></dt>
                  <dd>
                    <input id="acc-password" type="password" className="input" autoComplete="current-password"
                      placeholder="Needed to change your email" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </dd>
                </div>
              )}
            </dl>

            {editing && (
              <div className="mt-6">
                {error && <p role="alert" className={`${errorBox} mb-4`}>{error}</p>}
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
                  <button type="button" className="btn-ghost" onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            )}
          </form>
        </section>

        <section className="card animate-rise" style={{ animationDelay: '60ms' }}>
          <h2 className="font-extrabold">Session</h2>
          <p className="mt-1 text-sm text-slate-500">You are signed in on this device.</p>
          <button className="btn-ghost mt-5 w-full" onClick={handleLogout}>
            <LogOut className="size-4" /> Log out
          </button>
        </section>
      </div>

      {dialog === 'password' && <PasswordDialog onClose={() => setDialog(null)} />}
      {dialog === 'delete' && (
        <DeleteDialog onClose={() => setDialog(null)} onDeleted={() => { logout(); navigate('/login') }} />
      )}
    </>
  )
}
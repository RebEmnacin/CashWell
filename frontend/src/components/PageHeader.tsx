import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
  children?: ReactNode // right-side actions (buttons, month picker...)
}

export default function PageHeader({ title, subtitle, children }: Props) {
  return (
    <div className="mb-7 flex animate-rise flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h1>
        <span className="mt-2 block h-1 w-10 bg-accent-400" />
        {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}
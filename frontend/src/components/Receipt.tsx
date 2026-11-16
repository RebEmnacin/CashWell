/**
 * A paper RECEIPT card, CashWell's own card style: white paper, a dashed rule under the header, line items,
 * a bold total, a barcode, and a zig-zag torn bottom edge. Sharp corners, no rounded ones.
 *
 * Used on the home page ("How it works": three receipts hang on a line) and by `Slip` on the dashboard preview.
 */
import { type ReactNode } from 'react'

export type ReceiptLine = { label: string; value: string; tone?: 'plus' | 'minus' }

/** the zig-zag bottom: two triangles drawn with CSS, so the paper looks torn off the roll */
function TornEdge() {
  return (
    <span
      aria-hidden
      className="absolute inset-x-0 -bottom-2 block h-2 bg-white"
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 96% 0, 92% 100%, 88% 0, 84% 100%, 80% 0, 76% 100%, 72% 0, 68% 100%, 64% 0, 60% 100%, 56% 0, 52% 100%, 48% 0, 44% 100%, 40% 0, 36% 100%, 32% 0, 28% 100%, 24% 0, 20% 100%, 16% 0, 12% 100%, 8% 0, 4% 100%, 0 0)' }}
    />
  )
}

/** a small barcode: bars of different widths (drawn as SVG, no image file needed) */
function Barcode() {
  const bars = [2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 3, 1, 2, 2, 1, 3, 1, 2, 1, 1, 3, 2]
  let x = 0
  return (
    <svg viewBox="0 0 120 22" className="h-6 w-full max-w-[140px]" aria-hidden preserveAspectRatio="none">
      {bars.map((w, i) => {
        const rect = i % 2 === 0 ? <rect key={i} x={x} y={0} width={w * 1.6} height={22} fill="currentColor" /> : null
        x += w * 1.6
        return rect
      })}
    </svg>
  )
}

export default function Receipt({
  no,
  title,
  lines,
  totalLabel,
  totalValue,
  children,
  className = '',
}: {
  no: string
  title: string
  lines: ReceiptLine[]
  totalLabel: string
  totalValue: string
  children?: ReactNode
  className?: string
}) {
  return (
    // drop-shadow (not box-shadow) so the shadow follows the torn edge
    <div className={`relative drop-shadow-[0_10px_14px_rgba(15,40,35,0.18)] ${className}`}>
      <div className="relative bg-white px-5 pb-6 pt-7 font-mono text-ink">
        {/* the clip that holds it on the line */}
        <span aria-hidden className="absolute -top-3 left-1/2 h-6 w-3 -translate-x-1/2 bg-accent-400 ring-1 ring-accent-600/40" />

        <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">CashWell</p>
        <p className="mt-1 text-center text-[11px] font-semibold text-slate-500">Receipt No. {no}</p>
        <h3 className="mt-4 text-center font-sans text-base font-extrabold leading-snug text-brand-700">{title}</h3>

        <div className="my-4 border-t-2 border-dashed border-slate-300" />

        <ul className="space-y-2 text-[12px]">
          {lines.map((l) => (
            <li key={l.label} className="flex items-baseline justify-between gap-2">
              <span className="text-slate-600">{l.label}</span>
              <span className={`font-bold ${l.tone === 'plus' ? 'text-brand-600' : l.tone === 'minus' ? 'text-red-600' : 'text-ink'}`}>{l.value}</span>
            </li>
          ))}
        </ul>

        <div className="my-4 border-t-2 border-dashed border-slate-300" />

        <p className="flex items-baseline justify-between text-sm font-extrabold uppercase">
          <span>{totalLabel}</span>
          <span className="text-brand-700">{totalValue}</span>
        </p>

        {children}

        <div className="mt-5 flex justify-center text-slate-800">
          <Barcode />
        </div>
        <TornEdge />
      </div>
    </div>
  )
}

/** a small floating transaction slip: one line, with a coloured stripe on the left */
export function Slip({ label, value, tone, className = '' }: { label: string; value: string; tone: 'plus' | 'minus'; className?: string }) {
  return (
    <div className={`flex items-center gap-3 border-l-4 bg-white px-4 py-3 font-mono shadow-xl ${tone === 'plus' ? 'border-brand-600' : 'border-red-500'} ${className}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className={`text-sm font-extrabold ${tone === 'plus' ? 'text-brand-600' : 'text-red-600'}`}>{value}</span>
    </div>
  )
}

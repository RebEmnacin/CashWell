import { useLayoutEffect, useRef, type InputHTMLAttributes } from 'react'
import { cleanAmount, DECIMAL, formatAmount } from '../lib/format'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  /** Plain number string, e.g. "1231233.5" (no commas). */
  value: string
  onChange: (raw: string) => void
}

/** Text input that shows 1,231,233.50 as you type, while the parent keeps the plain number. */
export default function MoneyInput({ value, onChange, ...rest }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const caret = useRef<number | null>(null) // how many digits/decimal points sit left of the cursor

  // Re-place the cursor after React re-renders the formatted text
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || caret.current === null || document.activeElement !== el) return
    const target = caret.current
    const text = el.value
    let seen = 0
    let pos = 0
    while (pos < text.length && seen < target) {
      if (/\d/.test(text[pos]) || text[pos] === DECIMAL) seen++
      pos++
    }
    el.setSelectionRange(pos, pos)
    caret.current = null
  })

  return (
    <input
      {...rest}
      ref={ref}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={formatAmount(value)}
      onChange={(e) => {
        const typed = e.target.value
        const before = typed.slice(0, e.target.selectionStart ?? typed.length)
        caret.current = cleanAmount(before).length
        onChange(cleanAmount(typed))
      }}
      onBlur={(e) => {
        // On leave: always show two decimals ("1500" -> "1,500.00", "1500.5" -> "1,500.50")
        if (value) {
          const [i, d = ''] = value.split('.')
          onChange(`${i || '0'}.${d.padEnd(2, '0')}`)
        }
        rest.onBlur?.(e)
      }}
    />
  )
}

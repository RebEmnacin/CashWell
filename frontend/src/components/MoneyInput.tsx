import type { InputHTMLAttributes } from 'react'
import { amountTooLong, cleanAmount, DECIMAL, formatAmount, GROUP } from '../lib/format'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  /** Plain number string, e.g. "1231233.5" (no commas). */
  value: string
  onChange: (raw: string) => void
}

/**
 * Put the formatted text and the cursor into the field, but only touch what is actually different.
 * Typing a digit at the end needs no change at all, so the browser keeps handling the cursor itself.
 */
function setText(el: HTMLInputElement, text: string, count: number) {
  if (el.value !== text) el.value = text
  let seen = 0
  let pos = 0
  while (pos < text.length && seen < count) {
    if (/\d/.test(text[pos]) || text[pos] === DECIMAL) seen++
    pos++
  }
  if (el.selectionStart !== pos || el.selectionEnd !== pos) el.setSelectionRange(pos, pos)
}

/**
 * Text input that shows 1,231,233.50 as you type, while the parent keeps the plain number.
 * The formatted text and the cursor are set inside the event handler, so React never has to
 * rewrite the field afterwards (that rewrite is what makes the cursor jump or disappear).
 */
export default function MoneyInput({ value, onChange, ...rest }: Props) {
  return (
    <input
      {...rest}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={formatAmount(value)}
      onChange={(e) => {
        const el = e.currentTarget
        const typed = el.value
        const pos = el.selectionStart ?? typed.length
        const digitsBefore = cleanAmount(typed.slice(0, pos)).length
        const grew = typed.length - formatAmount(value).length

        // One extra keystroke that doesn't fit: put the old text back so digits are never pushed off the end
        if (amountTooLong(typed) && grew <= 1) {
          setText(el, formatAmount(value), Math.max(digitsBefore - 1, 0))
          return
        }
        const raw = cleanAmount(typed) // a pasted text that is too long is trimmed instead
        setText(el, formatAmount(raw), digitsBefore)
        onChange(raw)
      }}
      onKeyDown={(e) => {
        const el = e.currentTarget
        const { selectionStart: a, selectionEnd: b } = el
        if (a !== null && a === b) {
          // Backspace/Delete right next to a comma: step over it so a real digit gets deleted
          if (e.key === 'Backspace' && a > 0 && el.value[a - 1] === GROUP) el.setSelectionRange(a - 1, a - 1)
          if (e.key === 'Delete' && el.value[a] === GROUP) el.setSelectionRange(a + 1, a + 1)
        }
        rest.onKeyDown?.(e)
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
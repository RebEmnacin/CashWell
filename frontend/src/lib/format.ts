// Change CURRENCY to 'USD', 'EUR', etc. and LOCALE to 'en-US' to switch the whole app.
export const CURRENCY = 'PHP'
export const LOCALE = 'en-PH'

const moneyFmt = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY })
const compactFmt = new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 })

export const money = (n: number) => moneyFmt.format(n)
export const compact = (n: number) => compactFmt.format(n)

const pad = (n: number) => String(n).padStart(2, '0')

/** Local date as YYYY-MM-DD (avoids the UTC off-by-one you get from toISOString). */
export const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Local month as YYYY-MM. */
export const currentMonth = () => today().slice(0, 7)

export const prettyDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString(LOCALE, { month: 'short', day: 'numeric', year: 'numeric' })

export const prettyMonth = (ym: string) =>
  new Date(ym + '-01T00:00:00').toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' })

/** % change from previous to current. Returns null when there is nothing to compare. */
export const pctChange = (current: number, previous: number): number | null =>
  previous > 0 ? ((current - previous) / previous) * 100 : null

// ---- Amount inputs: live thousands separators (1231233 -> 1,231,233) ----
const numParts = new Intl.NumberFormat(LOCALE).formatToParts(1234567.1)
const GROUP = numParts.find((p) => p.type === 'group')?.value ?? ','
export const DECIMAL = numParts.find((p) => p.type === 'decimal')?.value ?? '.'

/** Anything the user typed or pasted -> a plain number string like "1234.5" (max 2 decimals). */
export const cleanAmount = (typed: string): string => {
  let s = ''
  let seenDot = false
  for (const ch of typed) {
    if (ch >= '0' && ch <= '9') s += ch
    else if ((ch === DECIMAL || ch === '.') && !seenDot) { s += '.'; seenDot = true }
  }
  let [int, dec] = s.split('.')
  int = int.replace(/^0+(?=\d)/, '').slice(0, 12)
  if (!seenDot) return int
  return `${int || '0'}.${(dec ?? '').slice(0, 2)}`
}

/** Plain number string -> display string with separators. Keeps a trailing "." or "0" while typing. */
export const formatAmount = (raw: string): string => {
  if (!raw) return ''
  const [int, dec] = raw.split('.')
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, GROUP)
  return raw.includes('.') ? `${grouped}${DECIMAL}${dec ?? ''}` : grouped
}

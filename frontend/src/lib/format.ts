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

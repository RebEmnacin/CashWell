/**
 * A hand using a calculator, drawn as one inline SVG (no image file). Same style as CoffeeCup and JarCoins:
 * white shapes with a thin darker edge for thickness, green details, a shadow on the ground, floating gently.
 * One 10-second loop:
 *  - the hand slides in from the right, lifts and hops from key to key, and taps 7, 4, 5, +, 1, 2, =
 *  - each key sinks when it is tapped, and the screen shows what was typed (745 + 12 = 757)
 *  - then the hand slides away, the screen clears and it starts again
 * The keyframes for the hand, the keys and the screen are generated from the `presses` list below.
 */

const LOOP = 10 // seconds for one full loop
const FIRST = 1.5 // seconds until the first tap
const GAP = 0.95 // seconds between taps
const LIFT = 11 // how high the hand hops between keys

// the keypad: 4 columns x 4 rows. `op` keys are the green ones.
const COLS = [82, 105, 128, 151]
const ROWS = [100, 124, 148, 172]
const keys = [
  ['7', '8', '9', '÷'],
  ['4', '5', '6', '×'],
  ['1', '2', '3', '−'],
  ['0', '.', '=', '+'],
]

// what is tapped, in order, and what the screen shows right after each tap
const presses = [
  { key: '7', screen: '7' },
  { key: '4', screen: '74' },
  { key: '5', screen: '745' },
  { key: '+', screen: '745 +' },
  { key: '1', screen: '1' },
  { key: '2', screen: '12' },
  { key: '=', screen: '757' },
]

const pos = (label: string) => {
  for (let r = 0; r < 4; r++) {
    const c = keys[r].indexOf(label)
    if (c >= 0) return { x: COLS[c], y: ROWS[r] }
  }
  return { x: 0, y: 0 }
}
const pct = (seconds: number) => +((seconds / LOOP) * 100).toFixed(2)

export default function HandCalculator({ className = '' }: { className?: string }) {
  const taps = presses.map((p, k) => ({ ...p, k, t: FIRST + k * GAP, ...pos(p.key) }))
  const last = taps[taps.length - 1]

  // --- the hand: slides in, then (lift, hop, tap) for every key, then slides away ---
  const IN = { dx: 70, dy: 36 } // where the hand waits, off to the right
  const steps: string[] = []
  const first = taps[0]
  steps.push(`0% { transform: translate(${first.x + IN.dx}px, ${first.y - LIFT + IN.dy}px); }`)
  taps.forEach((c, k) => {
    if (k === 0) {
      steps.push(`${pct(c.t - 0.3)}% { transform: translate(${c.x}px, ${c.y - LIFT}px); }`)
    } else {
      const p = taps[k - 1]
      steps.push(`${pct(p.t + 0.12)}% { transform: translate(${p.x}px, ${p.y + 1.5}px); }`)
      steps.push(`${pct(p.t + 0.3)}% { transform: translate(${p.x}px, ${p.y - LIFT}px); }`)
      steps.push(`${pct(c.t - 0.22)}% { transform: translate(${c.x}px, ${c.y - LIFT}px); }`)
    }
    steps.push(`${pct(c.t)}% { transform: translate(${c.x}px, ${c.y + 1.5}px); }`)
  })
  steps.push(`${pct(last.t + 0.14)}% { transform: translate(${last.x}px, ${last.y + 1.5}px); }`)
  steps.push(`${pct(last.t + 0.45)}% { transform: translate(${last.x}px, ${last.y - LIFT}px); }`)
  steps.push(`${pct(last.t + 1.5)}%, 100% { transform: translate(${last.x + IN.dx}px, ${last.y - LIFT + IN.dy}px); }`)
  // wait at the first position until the loop restarts (0% and 100% differ, so make 100% match 0%)
  const handCss = `@keyframes hcHand { ${steps.join('\n          ')} }`

  // --- each key sinks when it is tapped ---
  const keyCss = taps
    .map(
      (c) => `
        @keyframes hcKey${c.k} { 0%, ${pct(c.t) - 0.2}% { transform: translateY(0); } ${pct(c.t)}%, ${pct(c.t + 0.2)}% { transform: translateY(1.8px); } ${pct(c.t + 0.4)}%, 100% { transform: translateY(0); } }
        .hck${c.k} { animation: hcKey${c.k} ${LOOP}s linear infinite; }`,
    )
    .join('')

  // --- the screen: one text per state, each visible only between its tap and the next one ---
  const states = [{ screen: '0', from: 0, to: FIRST }, ...taps.map((c, k) => ({ screen: c.screen, from: c.t, to: k + 1 < taps.length ? taps[k + 1].t : LOOP - 0.4 })), { screen: '0', from: LOOP - 0.4, to: LOOP }]
  const screenCss = states
    .map(
      (s, i) => `
        @keyframes hcScr${i} { 0%, ${Math.max(pct(s.from) - 0.1, 0)}% { opacity: ${s.from === 0 ? 1 : 0}; } ${pct(s.from)}%, ${Math.max(pct(s.to) - 0.1, 0)}% { opacity: 1; } ${pct(s.to)}%, 100% { opacity: ${s.to >= LOOP ? 1 : 0}; } }
        .hcs${i} { animation: hcScr${i} ${LOOP}s linear infinite; }`,
    )
    .join('')

  return (
    <svg viewBox="0 0 280 230" overflow="visible" role="img" aria-label="A hand tapping numbers into a calculator" className={className}>
      <style>{`
        .hc-float  { animation: hcFloat 4.5s ease-in-out infinite; }
        .hc-shadow { transform-box: fill-box; transform-origin: center; animation: hcShadow 4.5s ease-in-out infinite; }
        .hc-hand   { animation: hcHand ${LOOP}s infinite; animation-timing-function: ease-in-out; }
        .hc-cursor { animation: hcBlink 1s steps(1) infinite; }
        @keyframes hcFloat  { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes hcShadow { 0%, 100% { transform: scaleX(1); opacity: .28; } 50% { transform: scaleX(.94); opacity: .2; } }
        @keyframes hcBlink  { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        ${handCss}
        ${keyCss}
        ${screenCss}
      `}</style>

      <defs>
        {/* the arm fades out toward the edge instead of ending in a hard cut */}
        <linearGradient id="hc-fade" gradientUnits="userSpaceOnUse" x1="0" y1="68" x2="0" y2="100">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="hc-arm" maskUnits="userSpaceOnUse" x="-60" y="-12" width="120" height="152">
          <rect x="-60" y="-12" width="120" height="80" fill="#fff" />
          <rect x="-60" y="68" width="120" height="72" fill="url(#hc-fade)" />
        </mask>
        <linearGradient id="hc-gloss" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#e3efe6" />
        </linearGradient>
      </defs>

      {/* ground shadow (stays put, only breathes) */}
      <ellipse className="hc-shadow" cx="118" cy="214" rx="84" ry="7" fill="#021a03" />

      <g className="hc-float">
        {/* ----- the calculator ----- */}
        {/* thickness: a darker copy of the body, a little lower */}
        <rect x="58" y="36" width="116" height="168" rx="15" fill="#a9c9b1" transform="translate(0 6)" />
        <rect x="58" y="36" width="116" height="168" rx="15" fill="url(#hc-gloss)" />
        {/* the screen */}
        <rect x="69" y="48" width="94" height="36" rx="7" fill="#053b06" />
        <rect x="69" y="48" width="94" height="36" rx="7" fill="none" stroke="#0b5d1e" strokeOpacity="0.8" strokeWidth="1.5" />
        <path d="M74 52 H120" stroke="#fff" strokeOpacity="0.18" strokeWidth="2" strokeLinecap="round" />
        <g fill="#c9f2d3" fontFamily="ui-monospace, 'SF Mono', Menlo, Consolas, monospace" fontWeight="700" fontSize="21" textAnchor="end">
          {states.map((s, i) => (
            <text key={i} className={`hcs${i}`} x="157" y="76" opacity={i === 0 ? 1 : 0}>
              {s.screen}
            </text>
          ))}
        </g>

        {/* the keys: each has an edge underneath, so it looks like it sticks out and can sink when tapped */}
        {keys.map((row, r) =>
          row.map((label, c) => {
            const op = c === 3 || label === '='
            const k = taps.findIndex((t) => t.key === label)
            return (
              <g key={label} className={k >= 0 ? `hck${k}` : undefined}>
                <rect x={COLS[c] - 10} y={ROWS[r] - 8 + 2.4} width="20" height="16" rx="5" fill={op ? '#053b06' : '#a9c9b1'} />
                <rect x={COLS[c] - 10} y={ROWS[r] - 8} width="20" height="16" rx="5" fill={op ? '#0b5d1e' : '#fff'} stroke={op ? 'none' : '#cfe3d4'} strokeWidth="1" />
                <text x={COLS[c]} y={ROWS[r] + 4.2} textAnchor="middle" fontSize="11" fontWeight="800" fontFamily="system-ui, sans-serif" fill={op ? '#fff' : '#0b5d1e'}>
                  {label}
                </text>
              </g>
            )
          }),
        )}

        {/* ----- the hand: the tip of the pointing finger is at (0,0), the arm runs down-right ----- */}
        <g className="hc-hand">
          <g transform="rotate(-24)" mask="url(#hc-arm)">
            {/* soft shadow of the hand on the calculator */}
            <ellipse cx="9" cy="14" rx="9" ry="14" fill="#021a03" fillOpacity="0.16" transform="translate(5 6)" />
            {/* arm and sleeve cuff */}
            <rect x="-17" y="62" width="32" height="76" rx="12" fill="#fff" />
            <rect x="-21" y="64" width="40" height="18" rx="7" fill="#0b5d1e" />
            <rect x="-21" y="64" width="40" height="5" rx="2.5" fill="#fff" fillOpacity="0.25" />
            {/* curled fingers (knuckles) on the left of the pointing finger */}
            <rect x="-26" y="26" width="19" height="19" rx="9.5" fill="#f1f7f3" stroke="#cfe3d4" strokeWidth="1" />
            <rect x="-27" y="38" width="19" height="19" rx="9.5" fill="#f1f7f3" stroke="#cfe3d4" strokeWidth="1" />
            <rect x="-25" y="50" width="18" height="17" rx="8.5" fill="#f1f7f3" stroke="#cfe3d4" strokeWidth="1" />
            {/* the palm */}
            <rect x="-16" y="24" width="34" height="48" rx="14" fill="#fff" stroke="#cfe3d4" strokeWidth="1" />
            {/* thumb, tucked on the right */}
            <rect x="12" y="34" width="13" height="30" rx="6.5" fill="#fff" stroke="#cfe3d4" strokeWidth="1" transform="rotate(14 18 49)" />
            {/* the pointing finger, with a nail */}
            <rect x="-6" y="-2" width="14" height="46" rx="7" fill="#fff" stroke="#cfe3d4" strokeWidth="1" />
            <rect x="-3.2" y="1" width="8.4" height="7" rx="3.4" fill="#d6eadb" />
            <path d="M-6 28 H8" stroke="#cfe3d4" strokeWidth="1" />
          </g>
        </g>
      </g>
    </svg>
  )
}

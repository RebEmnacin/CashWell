/**
 * A hand using a calculator, drawn as one inline SVG (no image file). Same style as CoffeeCup and JarCoins:
 * soft 3D shapes with a darker edge for thickness, a shadow on the ground, floating gently. The calculator is green so the
 * white cartoon glove (a pointing hand, like a mouse cursor) stands out against it.
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
        {/* calculator body: a little lighter at the top left */}
        <linearGradient id="hc-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1f9144" />
          <stop offset="1" stopColor="#0f6a26" />
        </linearGradient>
        {/* the glove: white lit from the top left, soft grey in the shade (in the glove's own coordinates) */}
        <linearGradient id="hc-glove" gradientUnits="userSpaceOnUse" x1="-30" y1="0" x2="34" y2="104">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#f1f5f2" />
          <stop offset="1" stopColor="#c9d4cd" />
        </linearGradient>
        {/* the solid shapes of the glove, used twice: once fat and grey for the outline, once in white on top */}
        <g id="hc-glove-shapes">
          <rect x="-7.5" y="-2" width="15.5" height="58" rx="7.75" />
          <rect x="-7.5" y="34" width="48" height="54" rx="20" />
          <rect x="-30" y="54" width="36" height="18" rx="9" transform="rotate(-32 -2 63)" />
          <rect x="-9" y="82" width="54" height="25" rx="11" />
        </g>
      </defs>

      {/* ground shadow (stays put, only breathes) */}
      <ellipse className="hc-shadow" cx="118" cy="214" rx="84" ry="7" fill="#021a03" />

      <g className="hc-float">
        {/* ----- the calculator ----- */}
        {/* thickness: a darker copy of the body, a little lower */}
        <rect x="58" y="36" width="116" height="168" rx="15" fill="#0a4a14" transform="translate(0 6)" />
        <rect x="58" y="36" width="116" height="168" rx="15" fill="url(#hc-body)" />
        {/* the screen */}
        <rect x="69" y="48" width="94" height="36" rx="7" fill="#053b06" />
        <rect x="69" y="48" width="94" height="36" rx="7" fill="none" stroke="#7dd69a" strokeOpacity="0.55" strokeWidth="1.5" />
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
                <rect x={COLS[c] - 10} y={ROWS[r] - 8 + 2.4} width="20" height="16" rx="5" fill={op ? '#5aa874' : '#a9c9b1'} />
                <rect x={COLS[c] - 10} y={ROWS[r] - 8} width="20" height="16" rx="5" fill={op ? '#c9f2d3' : '#fff'} />
                <text x={COLS[c]} y={ROWS[r] + 4.2} textAnchor="middle" fontSize="11" fontWeight="800" fontFamily="system-ui, sans-serif" fill="#0b5d1e">
                  {label}
                </text>
              </g>
            )
          }),
        )}

        {/* ----- the hand: the tip of the pointing finger is at (0,0), the arm runs down-right ----- */}
        <g className="hc-hand">
          <g transform="rotate(-24)">
            {/* outline, then the white glove on top (so the shapes merge into one smooth silhouette) */}
            <use href="#hc-glove-shapes" fill="#aebdb3" stroke="#aebdb3" strokeWidth="3.4" strokeLinejoin="round" />
            <use href="#hc-glove-shapes" fill="url(#hc-glove)" />

            {/* soft details: the groove between the finger and the fist, the thumb crease, the cuff fold */}
            <g fill="none" stroke="#b9c8be" strokeWidth="1.7" strokeLinecap="round" strokeOpacity="0.9">
              <path d="M8.5 40 C14 44 15.5 52 13.5 59" />
              <path d="M24 42 C31 46 34 54 32 63" />
              <path d="M-9 64 C-6 61 -3 60 0 60" />
              <path d="M-7 88 Q18 96 43 88" />
            </g>
            {/* highlights so it looks round and soft */}
            <g fill="#fff" fillOpacity="0.95">
              <ellipse cx="-2.2" cy="13" rx="2.3" ry="9" />
              <ellipse cx="-15" cy="56" rx="7" ry="3.6" transform="rotate(-32 -15 56)" />
              <ellipse cx="6" cy="52" rx="4.6" ry="9" />
              <ellipse cx="17" cy="94" rx="15" ry="3" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}
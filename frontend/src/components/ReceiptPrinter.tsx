/**
 * A receipt printer like the ones next to a cash register, drawn as one inline SVG (no image file).
 * Same style as CoffeeCup, JarCoins and HandCalculator: white shapes, a darker edge for thickness,
 * a shadow on the ground, floating gently.
 * One 9-second loop:
 *  - the receipt is printed out of the slot at a steady, linear speed (the tip comes out first)
 *  - it rests for a moment so it can be read (CASHWELL, a few items, a total and a barcode)
 *  - then it is pulled up and away, and the next one starts printing
 * The paper is clipped at the slot, so it looks like it comes from inside the machine.
 * If the visitor prefers reduced motion, the finished receipt just sits there.
 */

const SLOT_Y = 173 // where the paper meets the front rim of the slot
const PAPER_X = 68 // left edge of the paper
const PAPER_W = 104 // width of the paper
const PAPER_TOP = 11 // top (torn) edge of the paper when it is fully out
const TOOTH = 13 // width of one zigzag tooth on the torn edge

// the torn zigzag edge on top of the paper, then straight down and across the bottom
const teeth = Array.from({ length: PAPER_W / TOOTH }, (_, i) => {
  const x = PAPER_X + i * TOOTH
  return `L${x + TOOTH / 2} ${PAPER_TOP} L${x + TOOTH} ${PAPER_TOP + 6}`
}).join(' ')
const paperPath = `M${PAPER_X} ${PAPER_TOP + 6} ${teeth} L${PAPER_X + PAPER_W} ${SLOT_Y} L${PAPER_X} ${SLOT_Y} Z`

// the items on the receipt: how long the name bar is, and how long the price bar is
const items = [
  { name: 40, price: 14 },
  { name: 29, price: 18 },
  { name: 46, price: 12 },
  { name: 34, price: 16 },
]

// the barcode at the bottom: the width of each bar and the gap before it
const bars = [2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1]

export default function ReceiptPrinter({ className = '' }: { className?: string }) {
  // lay the barcode bars out one after another, centred under the totals
  let bx = 0
  const barcode = bars.map((w, i) => {
    const x = bx
    bx += w + 1.6
    return { x, w, i }
  })
  const barcodeLeft = PAPER_X + (PAPER_W - bx) / 2

  return (
    <svg viewBox="0 0 240 250" overflow="visible" role="img" aria-label="A receipt being printed out of a receipt printer" className={className}>
      <style>{`
        .rp-float  { animation: rpFloat 4.5s ease-in-out infinite; }
        .rp-shadow { transform-box: fill-box; transform-origin: center; animation: rpShadow 4.5s ease-in-out infinite; }
        .rp-paper  { animation: rpPaper 9s linear infinite; }
        .rp-led    { animation: rpLed 1.2s ease-in-out infinite; }
        @keyframes rpFloat  { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes rpShadow { 0%, 100% { transform: scaleX(1); opacity: .28; } 50% { transform: scaleX(.94); opacity: .2; } }
        @keyframes rpLed    { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
        /* hidden inside the machine -> printed out in one smooth straight line -> rests -> pulled up and away */
        @keyframes rpPaper {
          0%, 3%  { transform: translateY(165px); opacity: 1; animation-timing-function: linear; }
          44%     { transform: translateY(0); opacity: 1; }
          82%     { transform: translateY(0); opacity: 1; animation-timing-function: cubic-bezier(.5, 0, .8, .4); }
          92%     { transform: translateY(-60px); opacity: 0; }
          100%    { transform: translateY(-60px); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .rp-paper { animation: none; transform: translateY(0); }
        }
      `}</style>

      <defs>
        {/* printer body: white, a little grey at the bottom right */}
        <linearGradient id="rp-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d9e3dc" />
        </linearGradient>
        {/* paper: white, a little grey on the right so it looks like it curves */}
        <linearGradient id="rp-paper-fill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#f6f9f7" />
          <stop offset="1" stopColor="#e3ebe6" />
        </linearGradient>
        {/* only what is above the slot is visible, so the paper seems to come out of the machine
            (and it never draws outside the picture when it is pulled away) */}
        <clipPath id="rp-clip">
          <rect x="0" y="0" width="240" height={SLOT_Y} />
        </clipPath>
      </defs>

      {/* ground shadow (stays put, only breathes) */}
      <ellipse className="rp-shadow" cx="120" cy="240" rx="88" ry="7" fill="#021a03" />

      <g className="rp-float">
        {/* ----- the printer ----- */}
        {/* thickness: a darker copy of the body, a little lower */}
        <rect x="38" y="168" width="164" height="64" rx="16" fill="#aebdb3" transform="translate(0 5)" />
        <rect x="38" y="168" width="164" height="64" rx="16" fill="url(#rp-body)" />
        {/* the lid on top, with the paper slot cut into it */}
        <rect x="38" y="160" width="164" height="24" rx="12" fill="#ffffff" />
        <rect x="38" y="160" width="164" height="24" rx="12" fill="none" stroke="#aebdb3" strokeWidth="1.5" strokeOpacity="0.7" />
        <rect x="62" y="165" width="116" height="10" rx="5" fill="#053b06" />
        {/* the line where the lid meets the body */}
        <path d="M46 186 H194" stroke="#b9c8be" strokeWidth="1.7" strokeLinecap="round" strokeOpacity="0.9" />

        {/* ----- the receipt (clipped at the slot) ----- */}
        <g clipPath="url(#rp-clip)">
          <g className="rp-paper">
            {/* the paper and its soft edge */}
            <path d={paperPath} fill="url(#rp-paper-fill)" stroke="#c9d4cd" strokeWidth="1.2" strokeLinejoin="round" />

            {/* header */}
            <text
              x={PAPER_X + PAPER_W / 2}
              y="34"
              textAnchor="middle"
              fontSize="11"
              fontWeight="800"
              letterSpacing="1.5"
              fontFamily="ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
              fill="#0b5d1e"
            >
              CASHWELL
            </text>
            <rect x={PAPER_X + 34} y="40" width="36" height="3" rx="1.5" fill="#0b5d1e" fillOpacity="0.28" />
            <path d={`M${PAPER_X + 10} 52 H${PAPER_X + PAPER_W - 10}`} stroke="#0b5d1e" strokeOpacity="0.35" strokeWidth="1.2" strokeDasharray="3 3" />

            {/* items: a name and a price on each line */}
            {items.map((it, i) => (
              <g key={i} fill="#0b5d1e">
                <rect x={PAPER_X + 10} y={61 + i * 15} width={it.name} height="5" rx="2.5" fillOpacity="0.5" />
                <rect x={PAPER_X + PAPER_W - 10 - it.price} y={61 + i * 15} width={it.price} height="5" rx="2.5" fillOpacity="0.75" />
              </g>
            ))}
            <path d={`M${PAPER_X + 10} 123 H${PAPER_X + PAPER_W - 10}`} stroke="#0b5d1e" strokeOpacity="0.35" strokeWidth="1.2" strokeDasharray="3 3" />

            {/* total */}
            <text
              x={PAPER_X + 10}
              y="141"
              fontSize="10"
              fontWeight="800"
              letterSpacing="1"
              fontFamily="ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
              fill="#0b5d1e"
            >
              TOTAL
            </text>
            <rect x={PAPER_X + PAPER_W - 10 - 28} y="133" width="28" height="9" rx="3" fill="#0b5d1e" />

            {/* barcode */}
            <g fill="#0b5d1e" fillOpacity="0.85">
              {barcode.map((b) => (
                <rect key={b.i} x={barcodeLeft + b.x} y="152" width={b.w} height="14" />
              ))}
            </g>
          </g>
        </g>

        {/* the front rim of the slot, drawn over the paper so the paper comes out from behind it, from inside the machine */}
        <rect x="60" y={SLOT_Y - 0.5} width="120" height="5" rx="2.5" fill="#ffffff" stroke="#aebdb3" strokeWidth="0.8" strokeOpacity="0.6" />

        {/* ----- little details on the front of the printer ----- */}
        {/* status light and the feed button */}
        <circle className="rp-led" cx="64" cy="208" r="4.5" fill="#1f9144" />
        <circle cx="82" cy="208" r="4.5" fill="#c9f2d3" stroke="#5aa874" strokeWidth="1.5" />
        {/* the little grille where the printer would beep */}
        <g stroke="#b9c8be" strokeWidth="1.7" strokeLinecap="round">
          <path d="M150 203 H178" />
          <path d="M150 209 H178" />
          <path d="M150 215 H178" />
        </g>
        {/* highlight on the front so it looks round and soft */}
        <rect x="46" y="190" width="70" height="3" rx="1.5" fill="#fff" fillOpacity="0.95" />
      </g>
    </svg>
  )
}
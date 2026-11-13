/**
 * A glass jar that tips over, empties its coins one by one and builds a loose little heap beside it.
 * Drawn as one inline SVG (no image file), same style as CoffeeCup: white shapes, an oval opening with a dark
 * inside, soft highlights and a shadow on the ground. One 10-second loop:
 *  - 0-22%    the jar stands full, then tips over (about 98 degrees) and the coins slide toward the mouth
 *  - 23-75%   coins leave the jar ONE AT A TIME: each one disappears from inside the jar (so it gets emptier),
 *             slides out through the opening, spins in 3D as it arcs through the air and lands on the heap
 *  - 75-85%   the jar lies empty next to the finished heap
 *  - 85-100%  the jar stands back up, the heap fades away and the jar refills, then it starts again
 * The coins are separate layers: every coin has its own "inside the jar", "in the air" and "in the heap" copy,
 * and the keyframes for each are generated from the numbers below.
 * Coming out: the flying coins start INSIDE the neck and are clipped by a line across the opening, so they
 * visibly slide out through the mouth instead of popping up on the rim.
 */

const LOOP = 10 // seconds for one full loop
const FIRST = 2.3 // seconds until the first coin leaves
const GAP = 0.55 // seconds between coins leaving
const FALL = 1.05 // seconds a coin spends leaving the jar and flying to the heap

// the tipped jar sits at about 98 degrees: these are where its opening is and which way it points (in drawing units)
const TIP = 98
const RAD = (TIP * Math.PI) / 180
const AXIS = { x: Math.sin(RAD), y: -Math.cos(RAD) } // direction the neck points when tipped
const JAR = { x: 80, y: 140 } // where the jar's centre sits in the drawing
const RIM_Y = -61 // y of the opening in the upright jar
const MOUTH = { x: 0, y: 0 }
MOUTH.x = JAR.x + -RIM_Y * Math.sin(RAD)
MOUTH.y = JAR.y + RIM_Y * Math.cos(RAD)
const INSIDE = 22 // how far inside the neck the flying coins start (they are hidden until they cross the opening)
const START = { x: MOUTH.x - AXIS.x * INSIDE, y: MOUTH.y - AXIS.y * INSIDE }
const OUT = 34 // how far along the neck a coin travels before it starts arcing

// where each coin comes to rest on the heap (x, y, tilt in degrees). Bottom row first, then the layers on top.
const HEAP = [
  { x: 172, y: 206, rot: -4 },
  { x: 190, y: 207, rot: 3 },
  { x: 208, y: 206, rot: -2 },
  { x: 226, y: 207, rot: 5 },
  { x: 181, y: 200, rot: 6 },
  { x: 199, y: 200, rot: -5 },
  { x: 217, y: 200, rot: 3 },
  { x: 190, y: 194, rot: -3 },
  { x: 208, y: 194, rot: 6 },
]

// coins inside the jar (x, y in the upright jar). The top row sits nearest the mouth, so it leaves first.
const inside = [
  [-24, 29],
  [-8, 29],
  [8, 29],
  [24, 29],
  [-32, 46],
  [-16, 46],
  [0, 46],
  [16, 46],
  [32, 46],
]

const pct = (seconds: number) => +((seconds / LOOP) * 100).toFixed(2)

/** One coin facing the camera: rim, reeded edge, inner ring and a $ in the middle. `thick` adds a coin edge behind it. */
function Coin({ r = 8.5, thick = false }: { r?: number; thick?: boolean }) {
  return (
    <g>
      {thick && <circle cx="1.6" cy="1.8" r={r} fill="#a9c9b1" />}
      <circle r={r} fill="#fff" />
      {/* reeded (ridged) edge */}
      <circle r={r - 1.1} fill="none" stroke="#0b5d1e" strokeOpacity="0.4" strokeWidth="1.4" strokeDasharray="1.1 1.3" />
      {/* inner ring */}
      <circle r={r * 0.66} fill="none" stroke="#0b5d1e" strokeOpacity="0.5" strokeWidth="1.1" />
      {/* the $ */}
      <g fill="none" stroke="#0b5d1e" strokeOpacity="0.75" strokeWidth="1.3" strokeLinecap="round">
        <path d={`M${-r * 0.2} ${-r * 0.22} C${-r * 0.2} ${-r * 0.5} ${r * 0.24} ${-r * 0.5} ${r * 0.24} ${-r * 0.2} S${-r * 0.24} ${r * 0.12} ${-r * 0.24} ${r * 0.3} C${-r * 0.24} ${r * 0.5} ${r * 0.2} ${r * 0.5} ${r * 0.2} ${r * 0.24}`} />
        <path d={`M0 ${-r * 0.55} V${r * 0.55}`} />
      </g>
    </g>
  )
}

/** A coin lying on the heap, seen from slightly above: a thin edge under an oval top face. */
function HeapCoin({ x, y, rot }: { x: number; y: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <ellipse cy="2.8" rx="11" ry="4.4" fill="#a9c9b1" />
      <ellipse rx="11" ry="4.4" fill="#fff" />
      <ellipse rx="9.9" ry="3.8" fill="none" stroke="#0b5d1e" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="1.1 1.3" />
      <ellipse rx="7" ry="2.7" fill="none" stroke="#0b5d1e" strokeOpacity="0.5" strokeWidth="0.9" />
      <circle r="1.1" fill="#0b5d1e" fillOpacity="0.55" />
    </g>
  )
}

export default function JarCoins({ className = '' }: { className?: string }) {
  const coins = inside.map(([x, y], i) => {
    const leaves = FIRST + i * GAP // seconds when this coin leaves the jar
    const lands = leaves + FALL // seconds when it lands on the heap
    const h = HEAP[i] // where this coin ends up on the heap
    return {
      x, y, i, h,
      a: pct(leaves),
      b: pct(lands),
      dx: +(h.x - START.x).toFixed(1),
      dy: +(h.y - START.y).toFixed(1),
      spin: +(0.55 + (i % 3) * 0.12).toFixed(2), // seconds per full flip, a little different for every coin
      phase: +(-0.07 * i * 3).toFixed(2),
    }
  })

  const outX = +(AXIS.x * OUT).toFixed(1)
  const outY = +(AXIS.y * OUT).toFixed(1)

  // one set of keyframes per coin: inside the jar, flying (x and y separately, so it travels in an arc), in the heap
  const coinCss = coins
    .map((c) => {
      const e = +(c.a + (c.b - c.a) * 0.3).toFixed(2) // the coin is out of the neck here
      const m = +(c.a + (c.b - c.a) * 0.6).toFixed(2) // top of the arc
      return `
        @keyframes jji${c.i} { 0%, ${c.a - 0.4}% { opacity: 1; } ${c.a}%, 96% { opacity: 0; } 99%, 100% { opacity: 1; } }
        @keyframes jjx${c.i} {
          0%, ${c.a}% { transform: translateX(0); opacity: 0; animation-timing-function: ease-in; }
          ${c.a + 0.1}% { opacity: 1; }
          ${e}% { transform: translateX(${outX}px); animation-timing-function: linear; }
          ${c.b}% { transform: translateX(${c.dx}px); opacity: 1; }
          ${c.b + 0.2}%, 100% { transform: translateX(${c.dx}px); opacity: 0; }
        }
        @keyframes jjy${c.i} {
          0%, ${c.a}% { transform: translateY(0); animation-timing-function: ease-in; }
          ${e}% { transform: translateY(${outY}px); animation-timing-function: ease-out; }
          ${m}% { transform: translateY(${+(outY - 5).toFixed(1)}px); animation-timing-function: cubic-bezier(.45, 0, .9, .7); }
          ${c.b}%, 100% { transform: translateY(${c.dy}px); }
        }
        @keyframes jjs${c.i} { 0%, ${c.b}% { opacity: 0; } ${c.b + 0.2}%, 88% { opacity: 1; } 94%, 100% { opacity: 0; } }
        .jji${c.i} { animation: jji${c.i} ${LOOP}s linear infinite; }
        .jjx${c.i} { animation: jjx${c.i} ${LOOP}s linear infinite; }
        .jjy${c.i} { animation: jjy${c.i} ${LOOP}s linear infinite; }
        .jjs${c.i} { animation: jjs${c.i} ${LOOP}s linear infinite; }`
    })
    .join('\n')

  // everything in front of the opening (a big half-plane): coins are only visible once they have crossed the opening
  const px = -AXIS.y // a vector across the opening
  const py = AXIS.x
  const clip = [
    [MOUTH.x + px * 300, MOUTH.y + py * 300],
    [MOUTH.x - px * 300, MOUTH.y - py * 300],
    [MOUTH.x - px * 300 + AXIS.x * 600, MOUTH.y - py * 300 + AXIS.y * 600],
    [MOUTH.x + px * 300 + AXIS.x * 600, MOUTH.y + py * 300 + AXIS.y * 600],
  ]
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ')

  return (
    <svg viewBox="0 0 260 230" role="img" aria-label="A jar tipping over, pouring its coins into a growing heap" className={className}>
      <style>{`
        .jj-float  { animation: jjFloat 4.5s ease-in-out infinite; }
        .jj-shadow { transform-box: fill-box; transform-origin: center; animation: jjShadow 4.5s ease-in-out infinite; }
        .jj-tip    { transform-origin: 0 0; animation: jjTip ${LOOP}s infinite; }
        .jj-slide  { animation: jjSlide ${LOOP}s ease-in-out infinite; }
        .jj-spin   { transform-box: fill-box; transform-origin: center; animation: jjSpin var(--spin) ease-in-out infinite; animation-delay: var(--phase); }
        .jj-shade  { animation: jjShade var(--spin) ease-in-out infinite; animation-delay: var(--phase); }
        @keyframes jjFloat  { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes jjShadow { 0%, 100% { transform: scaleX(1); opacity: .28; } 50% { transform: scaleX(.94); opacity: .22; } }
        @keyframes jjTip {
          0%, 8%   { transform: rotate(0deg); animation-timing-function: cubic-bezier(.5, 0, .25, 1); }
          22%      { transform: rotate(${TIP + 6}deg); animation-timing-function: ease-in-out; }
          26%, 85% { transform: rotate(${TIP}deg); animation-timing-function: cubic-bezier(.5, 0, .25, 1); }
          94%, 100% { transform: rotate(0deg); }
        }
        @keyframes jjSlide { 0%, 10% { transform: translate(0, 0); } 24%, 85% { transform: translate(2px, -40px); } 94%, 100% { transform: translate(0, 0); } }
        @keyframes jjSpin  { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(-1); } }
        @keyframes jjShade { 0%, 50%, 100% { opacity: 0; } 25%, 75% { opacity: .45; } }
        ${coinCss}
      `}</style>

      <defs>
        {/* the glass: a little lighter at the edges, clearer in the middle */}
        <linearGradient id="jj-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.34" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.75" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.28" />
        </linearGradient>
        {/* only what is in front of the opening is visible: coins start hidden inside the neck */}
        <clipPath id="jj-out">
          <polygon points={clip} />
        </clipPath>
      </defs>

      {/* ground shadow (stays put, only breathes) */}
      <ellipse className="jj-shadow" cx="135" cy="216" rx="96" ry="7" fill="#021a03" />

      {/* the heap: one coin per coin that has landed, so it grows with every coin */}
      {coins.map((c) => (
        <g key={c.i} className={`jjs${c.i}`}>
          <HeapCoin x={c.h.x} y={c.h.y} rot={c.h.rot} />
        </g>
      ))}

      <g className="jj-float">
        {/* the jar: drawn upright around (0,0), then tipped by the .jj-tip rotation */}
        <g transform={`translate(${JAR.x} ${JAR.y})`}>
          <g className="jj-tip">
            {/* the floor of the jar, seen from slightly above (like the saucer under the cup) */}
            <ellipse cx="0" cy="46" rx="44" ry="10" fill="#053b06" fillOpacity="0.28" />

            {/* coins inside: each one disappears the moment it leaves, so the jar gets emptier */}
            <g className="jj-slide">
              {coins.map((c) => (
                <g key={c.i} className={`jji${c.i}`}>
                  <g transform={`translate(${c.x} ${c.y})`}>
                    <Coin thick />
                  </g>
                </g>
              ))}
            </g>

            {/* glass body: round shoulders and a round bottom, light edges, clear middle */}
            <path
              d="M-32 -54 H32 V-38 C46 -34 50 -22 50 -8 V38 C50 54 30 63 0 63 C-30 63 -50 54 -50 38 V-8 C-50 -22 -46 -34 -32 -38 Z"
              fill="url(#jj-glass)"
              stroke="#fff"
              strokeOpacity="0.92"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
            {/* highlights down the sides so the glass is not flat */}
            <path d="M-38 -6 V36" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="5" strokeLinecap="round" />
            <path d="M40 -2 V24" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="3" strokeLinecap="round" />
            <path d="M-20 -50 H-6" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="3" strokeLinecap="round" />

            {/* the rim: a short white ring seen from slightly above, with the dark opening inside */}
            <ellipse cx="0" cy="-53" rx="38" ry="8" fill="#fff" />
            <rect x="-38" y="-61" width="76" height="8" fill="#fff" />
            <ellipse cx="0" cy={RIM_Y} rx="38" ry="8" fill="#fff" />
            <ellipse cx="0" cy={RIM_Y} rx="30.5" ry="5.4" fill="#053b06" />
            <ellipse cx="0" cy={RIM_Y + 1.6} rx="26" ry="2.6" fill="#0b5d1e" fillOpacity="0.55" />
          </g>
        </g>

        {/* coins leaving: they start inside the neck (hidden), slide out through the opening, then arc to the heap.
            x and y are animated separately so each one flies in an arc, and each one spins in 3D. */}
        <g clipPath="url(#jj-out)">
          <g transform={`translate(${START.x.toFixed(1)} ${START.y.toFixed(1)})`}>
            {coins.map((c) => (
              <g key={c.i} className={`jjx${c.i}`}>
                <g className={`jjy${c.i}`}>
                  <g style={{ ['--spin' as string]: `${c.spin}s`, ['--phase' as string]: `${c.phase}s` }}>
                    {/* the coin's edge: only shows when the face has turned sideways */}
                    <rect x="-2.4" y="-8.5" width="4.8" height="17" rx="2.4" fill="#a9c9b1" />
                    <g className="jj-spin">
                      <Coin />
                      <circle r="8.5" fill="#053b06" className="jj-shade" />
                    </g>
                  </g>
                </g>
              </g>
            ))}
          </g>
        </g>
      </g>
    </svg>
  )
}
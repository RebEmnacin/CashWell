/**
 * A glass jar that tips over, empties its coins one by one and builds a loose little heap beside it.
 * Drawn as one inline SVG (no image file), same style as CoffeeCup. One 10-second loop:
 *  - 0-22%    the jar stands full, then tips over (about 100 degrees) and the coins slide toward the mouth
 *  - 23-75%   coins leave the jar ONE AT A TIME: each one disappears from inside the jar (so it gets emptier),
 *             spins out of the mouth in an arc (a 3D flip), and lands on the heap (so the heap grows)
 *  - 75-85%   the jar lies empty next to the finished heap
 *  - 85-100%  the jar stands back up, the heap fades away and the jar refills, then it starts again
 * The coins are separate layers: every coin has its own "inside the jar", "in the air" and "in the stack" copy,
 * and the keyframes for each are generated from the numbers below.
 * The 3D flip is faked: the face is squashed sideways (scaleX 1 -> -1) while a thin "edge" bar stays behind it
 * and a dark overlay fades in as the face turns away from the light.
 */

const LOOP = 10 // seconds for one full loop
const FIRST = 2.3 // seconds until the first coin leaves
const GAP = 0.55 // seconds between coins leaving
const FALL = 0.85 // seconds a coin spends in the air
const MOUTH = { x: 145, y: 151 } // where coins come out of the tipped jar
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

/** One coin facing the camera: rim, reeded edge, inner ring and a $ in the middle. */
function Coin({ r = 8.5 }: { r?: number }) {
  return (
    <g>
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
    const lands = leaves + FALL // seconds when it lands on the stack
    const h = HEAP[i] // where this coin ends up on the heap
    return {
      x, y, i, h,
      a: pct(leaves),
      b: pct(lands),
      dx: h.x - MOUTH.x,
      dy: h.y - MOUTH.y,
      spin: +(0.55 + (i % 3) * 0.12).toFixed(2), // seconds per full flip, a little different for every coin
      phase: +(-0.07 * i * 3).toFixed(2),
    }
  })

  // one set of keyframes per coin: inside the jar, flying (x and y separately, so it travels in an arc), in the heap
  const coinCss = coins
    .map(
      (c) => `
        @keyframes jji${c.i} { 0%, ${c.a - 0.4}% { opacity: 1; } ${c.a}%, 96% { opacity: 0; } 99%, 100% { opacity: 1; } }
        @keyframes jjx${c.i} {
          0%, ${c.a}% { transform: translateX(0); opacity: 0; }
          ${c.a + 0.2}% { opacity: 1; }
          ${c.b}% { transform: translateX(${c.dx}px); opacity: 1; }
          ${c.b + 0.2}%, 100% { transform: translateX(${c.dx}px); opacity: 0; }
        }
        @keyframes jjy${c.i} {
          0%, ${c.a}% { transform: translateY(0); animation-timing-function: ease-out; }
          ${+(c.a + (c.b - c.a) * 0.25).toFixed(2)}% { transform: translateY(-9px); animation-timing-function: cubic-bezier(.45, 0, .9, .7); }
          ${c.b}%, 100% { transform: translateY(${c.dy}px); }
        }
        @keyframes jjs${c.i} { 0%, ${c.b}% { opacity: 0; } ${c.b + 0.2}%, 88% { opacity: 1; } 94%, 100% { opacity: 0; } }
        .jji${c.i} { animation: jji${c.i} ${LOOP}s linear infinite; }
        .jjx${c.i} { animation: jjx${c.i} ${LOOP}s linear infinite; }
        .jjy${c.i} { animation: jjy${c.i} ${LOOP}s linear infinite; }
        .jjs${c.i} { animation: jjs${c.i} ${LOOP}s linear infinite; }`,
    )
    .join('\n')

  return (
    <svg viewBox="0 0 260 230" role="img" aria-label="A jar tipping over, pouring its coins into a growing stack" className={className}>
      <style>{`
        .jj-float  { animation: jjFloat 4.5s ease-in-out infinite; }
        .jj-shadow { transform-box: fill-box; transform-origin: center; animation: jjShadow 4.5s ease-in-out infinite; }
        .jj-tip    { transform-origin: 0 0; animation: jjTip ${LOOP}s infinite; }
        .jj-slide  { animation: jjSlide ${LOOP}s ease-in-out infinite; }
        .jj-spin   { transform-box: fill-box; transform-origin: center; animation: jjSpin var(--spin) ease-in-out infinite; animation-delay: var(--phase); }
        .jj-shade  { animation: jjShade var(--spin) ease-in-out infinite; animation-delay: var(--phase); }
        @keyframes jjFloat  { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes jjShadow { 0%, 100% { transform: scaleX(1); opacity: .28; } 50% { transform: scaleX(.92); opacity: .2; } }
        @keyframes jjTip {
          0%, 8%   { transform: rotate(0deg); animation-timing-function: cubic-bezier(.5, 0, .25, 1); }
          22%      { transform: rotate(104deg); animation-timing-function: ease-in-out; }
          26%, 85% { transform: rotate(98deg); animation-timing-function: cubic-bezier(.5, 0, .25, 1); }
          94%, 100% { transform: rotate(0deg); }
        }
        @keyframes jjSlide { 0%, 10% { transform: translateY(0); } 24%, 85% { transform: translateY(-44px); } 94%, 100% { transform: translateY(0); } }
        @keyframes jjSpin  { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(-1); } }
        @keyframes jjShade { 0%, 50%, 100% { opacity: 0; } 25%, 75% { opacity: .45; } }
        ${coinCss}
      `}</style>

      {/* ground shadow (stays put, only breathes) */}
      <ellipse className="jj-shadow" cx="135" cy="216" rx="96" ry="7" fill="#021a03" />

      {/* the heap: one coin per coin that has landed, so it grows with every coin */}
      {coins.map((c) => (
        <g key={c.i} className={`jjs${c.i}`}>
          <HeapCoin x={c.h.x} y={c.h.y} rot={c.h.rot} />
        </g>
      ))}

      {/* the jar: drawn upright around (0,0), then tipped by the .jj-tip rotation */}
      <g className="jj-float">
        <g transform="translate(80 140)">
          <g className="jj-tip">
            {/* coins inside: each one disappears the moment it leaves, so the jar gets emptier */}
            <g className="jj-slide">
              {coins.map((c) => (
                <g key={c.i} className={`jji${c.i}`}>
                  <g transform={`translate(${c.x} ${c.y})`}>
                    <Coin />
                  </g>
                </g>
              ))}
            </g>
            {/* glass: body, neck and rim */}
            <path
              d="M-32 -56 H32 V-38 C46 -34 50 -22 50 -8 V40 C50 54 40 62 26 62 H-26 C-40 62 -50 54 -50 40 V-8 C-50 -22 -46 -34 -32 -38 Z"
              fill="#fff"
              fillOpacity="0.16"
              stroke="#fff"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <rect x="-38" y="-68" width="76" height="12" rx="5" fill="#fff" />
            {/* a soft highlight down the side so the glass is not flat */}
            <path d="M-36 -4 V38" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="5" strokeLinecap="round" />
          </g>
        </g>
      </g>

      {/* coins in the air: x and y are animated separately so each one flies in an arc, and each spins in 3D */}
      <g transform={`translate(${MOUTH.x} ${MOUTH.y})`}>
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
    </svg>
  )
}
/**
 * A glass jar that tips over, empties its coins one by one and builds a tall stack beside it.
 * Drawn as one inline SVG (no image file), same style as CoffeeCup. One 10-second loop:
 *  - 0-22%    the jar stands full, then tips over (about 100 degrees) and the coins slide toward the mouth
 *  - 23-75%   coins leave the jar ONE AT A TIME: each one disappears from inside the jar (so it gets emptier),
 *             flies out of the mouth in an arc, and lands on top of the stack (so the stack grows taller)
 *  - 75-85%   the jar lies empty next to the finished stack
 *  - 85-100%  the jar stands back up, the stack fades away and the jar refills, then it starts again
 * The coins are separate layers: every coin has its own "inside the jar", "in the air" and "in the stack" copy,
 * and the keyframes for each are generated from the numbers below.
 */

const LOOP = 10 // seconds for one full loop
const FIRST = 2.3 // seconds until the first coin leaves
const GAP = 0.55 // seconds between coins leaving
const FALL = 0.85 // seconds a coin spends in the air
const MOUTH = { x: 145, y: 151 } // where coins come out of the tipped jar
const STACK = { x: 218, floor: 207, step: 4.5 } // x of the stack, y of the ground, height of one coin in the stack

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

/** One coin facing the camera: a white disc with a green ring. */
function Coin({ r = 8.5 }: { r?: number }) {
  return (
    <g>
      <circle r={r} fill="#fff" />
      <circle r={r * 0.62} fill="none" stroke="#0b5d1e" strokeOpacity="0.4" strokeWidth="2" />
    </g>
  )
}

export default function JarCoins({ className = '' }: { className?: string }) {
  const coins = inside.map(([x, y], i) => {
    const leaves = FIRST + i * GAP // seconds when this coin leaves the jar
    const lands = leaves + FALL // seconds when it lands on the stack
    const stackY = STACK.floor - i * STACK.step // y of this coin once it sits in the stack
    return { x, y, i, a: pct(leaves), b: pct(lands), dx: STACK.x - MOUTH.x, dy: stackY - MOUTH.y, stackY }
  })

  // one set of keyframes per coin: inside the jar, flying (x and y separately, so it travels in an arc), in the stack
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
        .jj-flip   { transform-box: fill-box; transform-origin: center; animation: jjFlip .4s ease-in-out infinite alternate; }
        @keyframes jjFloat  { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes jjShadow { 0%, 100% { transform: scaleX(1); opacity: .28; } 50% { transform: scaleX(.92); opacity: .2; } }
        @keyframes jjTip {
          0%, 8%   { transform: rotate(0deg); animation-timing-function: cubic-bezier(.5, 0, .25, 1); }
          22%      { transform: rotate(104deg); animation-timing-function: ease-in-out; }
          26%, 85% { transform: rotate(98deg); animation-timing-function: cubic-bezier(.5, 0, .25, 1); }
          94%, 100% { transform: rotate(0deg); }
        }
        @keyframes jjSlide { 0%, 10% { transform: translateY(0); } 24%, 85% { transform: translateY(-44px); } 94%, 100% { transform: translateY(0); } }
        @keyframes jjFlip  { from { transform: scaleX(1); } to { transform: scaleX(.2); } }
        ${coinCss}
      `}</style>

      {/* ground shadow (stays put, only breathes) */}
      <ellipse className="jj-shadow" cx="135" cy="216" rx="96" ry="7" fill="#021a03" />

      {/* the stack: one flat coin per coin that has landed, so it grows taller with every coin */}
      {coins.map((c) => (
        <ellipse
          key={c.i}
          className={`jjs${c.i}`}
          cx={STACK.x}
          cy={c.stackY}
          rx="10.5"
          ry="3.4"
          fill="#fff"
          stroke="#0b5d1e"
          strokeOpacity="0.3"
          strokeWidth="1.5"
        />
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

      {/* coins in the air: x and y are animated separately so each one flies in an arc */}
      <g transform={`translate(${MOUTH.x} ${MOUTH.y})`}>
        {coins.map((c) => (
          <g key={c.i} className={`jjx${c.i}`}>
            <g className={`jjy${c.i}`}>
              <g className="jj-flip">
                <Coin />
              </g>
            </g>
          </g>
        ))}
      </g>
    </svg>
  )
}
/**
 * A glass jar that tips over and pours coins, drawn as one inline SVG (no image file). Same style as CoffeeCup.
 * One 7-second loop:
 *  - 0-10%   the jar stands upright, the coins settle at the bottom
 *  - 10-40%  the jar tips over (rotates about 100 degrees) and the coins inside slide toward the mouth
 *  - 38-84%  coins keep tumbling out, arc through the air and land on a little pile
 *  - 84-100% the jar stands back up and the pile fades away, then it starts again
 * The whole jar also floats gently up and down, and the shadow on the ground breathes with it.
 */
export default function JarCoins({ className = '' }: { className?: string }) {
  // the coins that fall out: dx = how far right they travel, dy = how far down they drop,
  // dur = seconds per fall, delay = negative so the coins never fall in sync
  const coins = [
    { dx: 40, dy: 54, dur: 1.9, delay: 0 },
    { dx: 58, dy: 52, dur: 2.2, delay: -0.5 },
    { dx: 72, dy: 55, dur: 2.0, delay: -1.0 },
    { dx: 50, dy: 53, dur: 2.4, delay: -1.5 },
    { dx: 84, dy: 56, dur: 2.1, delay: -0.25 },
    { dx: 66, dy: 54, dur: 2.3, delay: -1.2 },
    { dx: 46, dy: 55, dur: 2.0, delay: -0.8 },
    { dx: 78, dy: 53, dur: 2.2, delay: -1.8 },
  ]

  /** One coin facing the camera: a white disc with a green ring. */
  const Coin = ({ r = 9 }: { r?: number }) => (
    <g>
      <circle r={r} fill="#fff" />
      <circle r={r * 0.62} fill="none" stroke="#0b5d1e" strokeOpacity="0.4" strokeWidth="2" />
    </g>
  )

  return (
    <svg viewBox="0 0 260 230" role="img" aria-label="A jar tipping over and pouring coins" className={className}>
      <style>{`
        .jj-float  { animation: jjFloat 4.5s ease-in-out infinite; }
        .jj-shadow { transform-box: fill-box; transform-origin: center; animation: jjShadow 4.5s ease-in-out infinite; }
        .jj-tip    { transform-origin: 0 0; animation: jjTip 7s infinite; }
        .jj-slide  { animation: jjSlide 7s ease-in-out infinite; }
        .jj-gate   { animation: jjGate 7s linear infinite; }
        .jj-x      { animation: jjX var(--dur) linear infinite; animation-delay: var(--delay); }
        .jj-y      { animation: jjY var(--dur) infinite; animation-delay: var(--delay); }
        .jj-flip   { transform-box: fill-box; transform-origin: center; animation: jjFlip .4s ease-in-out infinite alternate; animation-delay: var(--delay); }
        @keyframes jjFloat  { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes jjShadow { 0%, 100% { transform: scaleX(1); opacity: .28; } 50% { transform: scaleX(.9); opacity: .18; } }
        @keyframes jjTip {
          0%, 10% { transform: rotate(0deg); animation-timing-function: cubic-bezier(.5, 0, .25, 1); }
          34%     { transform: rotate(104deg); animation-timing-function: ease-in-out; }
          40%, 84% { transform: rotate(98deg); animation-timing-function: cubic-bezier(.5, 0, .25, 1); }
          100%    { transform: rotate(0deg); }
        }
        @keyframes jjSlide { 0%, 12% { transform: translateY(0); } 36%, 84% { transform: translateY(-20px); } 100% { transform: translateY(0); } }
        @keyframes jjGate  { 0%, 32% { opacity: 0; } 38%, 84% { opacity: 1; } 92%, 100% { opacity: 0; } }
        @keyframes jjX { 0% { transform: translateX(0); opacity: 0; } 8% { opacity: 1; } 88% { opacity: 1; } 100% { transform: translateX(var(--dx)); opacity: 0; } }
        @keyframes jjY {
          0%   { transform: translateY(0);   animation-timing-function: ease-out; }
          22%  { transform: translateY(-9px); animation-timing-function: cubic-bezier(.45, 0, .9, .7); }
          100% { transform: translateY(var(--dy)); }
        }
        @keyframes jjFlip { from { transform: scaleX(1); } to { transform: scaleX(.2); } }
      `}</style>

      {/* ground shadow (stays put, only breathes) */}
      <ellipse className="jj-shadow" cx="135" cy="216" rx="92" ry="7" fill="#021a03" />

      <g className="jj-float">
        {/* the little pile the coins land on */}
        <g className="jj-gate">
          {[
            { x: 192, y: 207, n: 1 },
            { x: 208, y: 207, n: 3 },
            { x: 226, y: 207, n: 2 },
          ].map((s) =>
            Array.from({ length: s.n }, (_, i) => (
              <ellipse
                key={`${s.x}-${i}`}
                cx={s.x}
                cy={s.y - i * 4.5}
                rx="10"
                ry="3.4"
                fill="#fff"
                stroke="#0b5d1e"
                strokeOpacity="0.3"
                strokeWidth="1.5"
              />
            )),
          )}
        </g>

        {/* the jar: drawn upright around (0,0), then tipped by the .jj-tip rotation */}
        <g transform="translate(80 140)">
          <g className="jj-tip">
            {/* coins inside, sliding toward the mouth as it tips */}
            <g className="jj-slide">
              {[
                [-24, 44],
                [0, 48],
                [24, 44],
                [-12, 28],
                [12, 29],
              ].map(([x, y], i) => (
                <g key={i} transform={`translate(${x} ${y})`}>
                  <Coin />
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

        {/* coins pouring out of the mouth: x and y are animated separately so they fly in an arc */}
        <g className="jj-gate" transform="translate(145 151)">
          {coins.map((c, i) => (
            <g key={i} className="jj-x" style={{ ['--dx' as string]: `${c.dx}px`, ['--dur' as string]: `${c.dur}s`, ['--delay' as string]: `${c.delay}s` }}>
              <g className="jj-y" style={{ ['--dy' as string]: `${c.dy}px`, ['--dur' as string]: `${c.dur}s`, ['--delay' as string]: `${c.delay}s` }}>
                <g className="jj-flip" style={{ ['--delay' as string]: `${c.delay}s` }}>
                  <Coin r={9.5} />
                </g>
              </g>
            </g>
          ))}
        </g>
      </g>
    </svg>
  )
}

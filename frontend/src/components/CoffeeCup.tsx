/**
 * A coffee cup on a saucer, drawn as one inline SVG (no image file).
 *  - the cup, saucer and steam float up and down together (ease-in-out, loops forever)
 *  - the steam is three wavy lines whose dashes flow upward at a constant speed (linear, loops forever)
 *    and dissolve toward the top
 *  - the shadow on the ground shrinks a little as the cup rises
 */
export default function CoffeeCup({ className = '' }: { className?: string }) {
  // the three steam wisps: path, line width, seconds per loop, and a negative delay so they never move in sync
  const steam = [
    { d: 'M82 96 C70 84 94 74 82 62 S70 40 82 28 S74 12 82 4', w: 5, dur: 2.8, delay: -0.4 },
    { d: 'M100 94 C112 80 88 70 100 56 S112 32 100 20 S108 6 100 0', w: 6, dur: 3.4, delay: -1.7 },
    { d: 'M118 96 C106 84 130 74 118 62 S106 40 118 28 S126 12 118 4', w: 5, dur: 3.0, delay: -2.3 },
  ]

  return (
    <svg viewBox="0 0 200 224" role="img" aria-label="A cup of coffee with steam rising" className={className}>
      <style>{`
        .cw-float  { animation: cwFloat 4s ease-in-out infinite; }
        .cw-shadow { transform-box: fill-box; transform-origin: center; animation: cwShadow 4s ease-in-out infinite; }
        .cw-steam  { stroke-dasharray: 46 34; animation: cwSteam var(--dur) linear infinite; animation-delay: var(--delay); }
        @keyframes cwFloat  { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes cwShadow { 0%, 100% { transform: scaleX(1); opacity: .28; } 50% { transform: scaleX(.82); opacity: .16; } }
        @keyframes cwSteam  { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -80; } }
      `}</style>

      <defs>
        {/* steam is solid near the cup and dissolves toward the top */}
        <linearGradient id="cw-fade" gradientUnits="userSpaceOnUse" x1="0" y1="98" x2="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.18" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="cw-steam-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="100">
          <rect x="0" y="0" width="200" height="100" fill="url(#cw-fade)" />
        </mask>
      </defs>

      {/* ground shadow (stays put, only breathes) */}
      <ellipse className="cw-shadow" cx="100" cy="212" rx="58" ry="6" fill="#021a03" />

      <g className="cw-float">
        {/* steam */}
        <g mask="url(#cw-steam-mask)" fill="none" stroke="#fff" strokeLinecap="round">
          {steam.map((s, i) => (
            <path
              key={i}
              d={s.d}
              strokeWidth={s.w}
              className="cw-steam"
              style={{ ['--dur' as string]: `${s.dur}s`, ['--delay' as string]: `${s.delay}s` }}
            />
          ))}
        </g>

        {/* saucer */}
        <ellipse cx="100" cy="184" rx="78" ry="11" fill="#fff" fillOpacity="0.9" />
        <ellipse cx="100" cy="181" rx="52" ry="6" fill="#0b5d1e" fillOpacity="0.18" />

        {/* handle */}
        <path d="M148 116 C176 112 176 152 146 154" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" />

        {/* cup */}
        <path d="M50 106 H150 V132 C150 158 130 176 100 176 C70 176 50 158 50 132 Z" fill="#fff" />
        <ellipse cx="100" cy="106" rx="50" ry="10" fill="#fff" />
        {/* the coffee */}
        <ellipse cx="100" cy="106" rx="43" ry="6.5" fill="#053b06" />
        {/* a soft highlight down the left side so the cup is not flat */}
        <path d="M60 122 C60 140 68 156 84 166" fill="none" stroke="#0b5d1e" strokeOpacity="0.14" strokeWidth="7" strokeLinecap="round" />
      </g>
    </svg>
  )
}

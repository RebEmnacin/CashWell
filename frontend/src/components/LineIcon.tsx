import type { LucideIcon } from 'lucide-react'
import { animate, stagger, useInView } from 'motion/react'
import { useEffect, useLayoutEffect, useRef } from 'react'

/**
 * Animated line-art version of any lucide icon.
 *
 * How it works:
 *  1. Every line inside the icon (path, circle, rect...) is told "your total length is 1".
 *  2. We hide each line with a dash pattern, then slide the dash (strokeDashoffset) to make the line
 *     look like a pen drawing it. Offset 1 = hidden, 0 = fully drawn, -1 = hidden again (erased from the start).
 *  3. Lines start one after another (stagger) so multi-part icons build up piece by piece.
 *
 * Two modes:
 *  - loop (default): draw -> hold -> erase -> repeat forever. Pauses while the icon is off screen.
 *  - loop={false}:   draw once when it scrolls into view and stay drawn (used for the check marks).
 *
 * Usage:  <LineIcon icon={PiggyBank} className="size-12" strokeWidth={1.75} delay={0.2} />
 *         <LineIcon icon={Check} className="size-4" loop={false} reverse />
 */

// every kind of line a lucide icon can be made of
const SHAPES = 'path, circle, rect, line, polyline, polygon, ellipse'

// pattern "1 1.5" = 1 unit of line, then a 1.5 unit gap. With pathLength=1 the whole icon line is 1 unit long.
const DASH = '1 1.5'

// false = always play the animation, even if the computer has "reduce motion" / "animation effects off" turned on.
// true  = respect that accessibility setting (those people just see the finished icon, no animation).
const RESPECT_REDUCED_MOTION = false

// ----- loop timing (edit these to change the feel) -----
const LOOP_SECONDS = 3.4 // length of one full draw -> hold -> erase cycle
const LOOP_PAUSE = 0.4 // empty pause before the next cycle starts
const LOOP_TIMES = [0, 0.28, 0.72, 1] // when each step ends: draw done at 28%, hold until 72%, erase done at 100%
const DRAW_SECONDS = 0.9 // length of the one-time draw (loop={false})
const LINE_STAGGER = 0.14 // seconds between one line starting and the next

type LineIconProps = {
  icon: LucideIcon
  className?: string
  strokeWidth?: number
  /** seconds to wait before the first draw (after the icon scrolls into view) */
  delay?: number
  /** true = keep drawing and erasing forever. false = draw once and stay. */
  loop?: boolean
  /** true = draw each line from its END to its START. Needed for the check mark, whose line is stored right-to-left. */
  reverse?: boolean
}

export default function LineIcon({
  icon: Icon,
  className,
  strokeWidth = 1.75,
  delay = 0,
  loop = true,
  reverse = false,
}: LineIconProps) {
  const ref = useRef<SVGSVGElement>(null)
  const controls = useRef<ReturnType<typeof animate> | null>(null)
  // not "once": loops pause when the icon leaves the screen and resume when it comes back
  const inView = useInView(ref, { margin: '-60px' })

  // only true when the switch above is on AND the person's computer asks for reduced motion
  const reduced =
    RESPECT_REDUCED_MOTION && typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // "hidden" offset: 1 hides the line when drawing start -> end, -1 hides it when drawing end -> start
  const hidden = reverse ? -1 : 1

  const getShapes = () => Array.from(ref.current?.querySelectorAll<SVGElement>(SHAPES) ?? [])

  // runs before the first paint: hide every line so the finished icon never flashes on screen
  useLayoutEffect(() => {
    if (reduced || controls.current) return // controls.current set = already animating (hot reload safe)
    getShapes().forEach((el) => {
      el.setAttribute('pathLength', '1')
      el.style.strokeDasharray = DASH
      el.style.strokeDashoffset = String(hidden)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, hidden])

  // starts the animation and returns its controls (so we can pause it later)
  const start = () => {
    const shapes = getShapes()
    const lineDelay = stagger(LINE_STAGGER, { startDelay: delay })
    if (loop) {
      // hidden -> drawn -> (hold) -> hidden on the other side, then it jumps back to hidden (looks identical) and repeats
      return animate(
        shapes,
        { strokeDashoffset: [hidden, 0, 0, -hidden] },
        {
          duration: LOOP_SECONDS,
          times: LOOP_TIMES,
          ease: ['easeInOut', 'linear', 'easeInOut'],
          delay: lineDelay,
          repeat: Infinity,
          repeatDelay: LOOP_PAUSE,
        },
      )
    }
    return animate(shapes, { strokeDashoffset: [hidden, 0] }, { duration: DRAW_SECONDS, ease: 'easeInOut', delay: lineDelay })
  }

  // start when the icon scrolls into view; loops pause off screen and resume on return
  useEffect(() => {
    if (reduced) return
    if (inView) {
      if (!controls.current) controls.current = start()
      else if (loop) controls.current.play()
    } else if (loop) {
      controls.current?.pause()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, loop])

  // stop the animation when the icon is removed from the page
  useEffect(
    () => () => {
      controls.current?.stop()
      controls.current = null
    },
    [],
  )

  return <Icon ref={ref} className={className} strokeWidth={strokeWidth} aria-hidden />
}

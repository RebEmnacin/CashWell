import { motion, useScroll, useSpring, useTransform, type MotionStyle } from 'motion/react'
import { useRef, type ReactNode } from 'react'

/** Where an element starts (before it scrolls into place). Anything left out stays at its normal value. */
export interface ScrubFrom {
  x?: number // slide sideways, in px
  y?: number // slide up/down, in px
  scale?: number // 1.3 = starts 30% bigger (zooms OUT to size), 0.8 = starts smaller (zooms IN)
  rotateX?: number // tip forwards/backwards, in degrees (needs the 3D perspective below)
  rotateY?: number // swing like a door, in degrees
  rotateZ?: number // plain tilt, in degrees
}

/**
 * Scroll-scrubbed motion: the animation moves exactly as far as the scrollbar moves.
 * Scrolling down brings the element from its `from` pose to its normal pose. When it leaves through the top it
 * drifts into a mirrored pose, so scrolling back UP plays the entrance again (it is never "used up").
 * (A normal "reveal" plays once and is done. This one is tied to the scroll position.)
 *
 * It deliberately ignores the system "reduce motion" setting: on Windows, turning off "Show animations" would
 * otherwise switch every scroll effect off and the page would look like it has none.
 *
 * offset = [when it starts, when it finishes], each written as "<element edge> <viewport edge>".
 *   'start end'      = the element's top touches the bottom of the screen (just entering)
 *   'center 0.7'     = the element's middle is 70% of the way down the screen (settled)
 */
export default function Scrub({
  children,
  from,
  offset = ['start end', 'center 0.7'],
  className = '',
  as = 'div',
}: {
  children: ReactNode
  from: ScrubFrom
  offset?: [string, string]
  className?: string
  as?: 'div' | 'li' | 'section'
}) {
  const ref = useRef<HTMLElement>(null)

  // ENTER: 0 -> 1 while the element rises into place from the bottom of the screen
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: offset as never })
  // EXIT: 0 -> 1 while its bottom edge leaves through the top of the screen.
  // Scrolling back UP is just this in reverse, so the element swings back in from above and the animation plays again.
  const { scrollYProgress: leave } = useScroll({ target: ref, offset: ['end 0.25', 'end start'] as never })
  // a light spring so fast scrolling still feels smooth instead of jumping
  const spring = { stiffness: 140, damping: 26, mass: 0.4 }
  const p = useSpring(enter, spring)
  const q = useSpring(leave, spring)

  // the exit pose is the enter pose mirrored: it leaves upwards, so it comes back DOWN from above
  const x = useTransform([p, q], ([a, b]: number[]) => (1 - a) * (from.x ?? 0) + b * (from.x ?? 0))
  const y = useTransform([p, q], ([a, b]: number[]) => (1 - a) * (from.y ?? 0) - b * (from.y ?? 0))
  const scale = useTransform([p, q], ([a, b]: number[]) => (1 + (1 - a) * ((from.scale ?? 1) - 1)) * (1 + b * ((from.scale ?? 1) - 1)))
  const rotateX = useTransform([p, q], ([a, b]: number[]) => (1 - a) * (from.rotateX ?? 0) - b * (from.rotateX ?? 0))
  const rotateY = useTransform([p, q], ([a, b]: number[]) => (1 - a) * (from.rotateY ?? 0) + b * (from.rotateY ?? 0))
  const rotateZ = useTransform([p, q], ([a, b]: number[]) => (1 - a) * (from.rotateZ ?? 0) + b * (from.rotateZ ?? 0))

  const Tag = motion[as] as typeof motion.div
  const style: MotionStyle = { x, y, scale, rotateX, rotateY, rotateZ, transformPerspective: 1200 }
  return (
    <Tag ref={ref as never} style={style} className={className}>
      {children}
    </Tag>
  )
}
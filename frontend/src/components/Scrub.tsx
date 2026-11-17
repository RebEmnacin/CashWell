import { motion, useScroll, useSpring, useTransform, type MotionStyle, type MotionValue } from 'motion/react'
import { useRef, type ReactNode } from 'react'

/** Where an element starts (before it scrolls into place). Anything left out stays at its normal value. */
export interface ScrubFrom {
  x?: number // slide sideways, in px
  y?: number // slide up/down, in px
  scale?: number // 1.3 = starts 30% bigger (zooms OUT to size), 0.8 = starts smaller (zooms IN)
  rotateX?: number // tip forwards/backwards, in degrees (needs the 3D perspective below)
  rotateY?: number // swing like a door, in degrees
  rotateZ?: number // plain tilt, in degrees
  scaleX?: number // 0 = starts as nothing and grows sideways (used for lines that draw themselves)
}

/**
 * Wraps a scroll-progress value (0 -> 1) so it can only ever go UP.
 * The animation follows you while you scroll down, and once it has played it stays finished:
 * scrolling back up does not rewind it.
 */
export function useLatched(progress: MotionValue<number>) {
  const best = useRef(0)
  return useTransform(progress, (v) => {
    best.current = Math.max(best.current, v)
    return best.current
  })
}

/**
 * Scroll-scrubbed motion: the animation moves as far as the scrollbar moves (going DOWN), from the `from` pose
 * to the normal pose. It plays once; scrolling back up leaves everything settled (see useLatched above).
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
  origin = 'center',
}: {
  children?: ReactNode
  from: ScrubFrom
  offset?: [string, string]
  className?: string
  as?: 'div' | 'li' | 'section'
  origin?: 'center' | 'left' // which side a scaleX growth starts from
}) {
  const ref = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({ target: ref, offset: offset as never })
  // a light spring so fast scrolling still feels smooth instead of jumping
  const p = useSpring(useLatched(scrollYProgress), { stiffness: 140, damping: 26, mass: 0.4 })

  const x = useTransform(p, [0, 1], [from.x ?? 0, 0])
  const y = useTransform(p, [0, 1], [from.y ?? 0, 0])
  const scale = useTransform(p, [0, 1], [from.scale ?? 1, 1])
  const rotateX = useTransform(p, [0, 1], [from.rotateX ?? 0, 0])
  const rotateY = useTransform(p, [0, 1], [from.rotateY ?? 0, 0])
  const rotateZ = useTransform(p, [0, 1], [from.rotateZ ?? 0, 0])
  const scaleX = useTransform(p, [0, 1], [from.scaleX ?? 1, 1])

  const Tag = motion[as] as typeof motion.div
  const style: MotionStyle = { x, y, scale, scaleX, rotateX, rotateY, rotateZ, transformPerspective: 1200, originX: origin === 'left' ? 0 : 0.5 }
  return (
    <Tag ref={ref as never} style={style} className={className}>
      {children}
    </Tag>
  )
}
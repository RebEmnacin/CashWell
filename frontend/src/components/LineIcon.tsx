import type { LucideIcon } from 'lucide-react'
import { animate, stagger, useInView } from 'motion/react'
import { useEffect, useLayoutEffect, useRef } from 'react'

/**
 * Draws any lucide icon on screen like a pen sketching it (animated line art).
 *
 * How it works:
 *  1. Every line inside the icon (path, circle, rect...) is told "your total length is 1".
 *  2. We hide each line with a dash pattern, then slide the dash (strokeDashoffset) from 1 -> 0,
 *     which makes the line look like it is being drawn from start to end.
 *  3. Lines are drawn one after another (stagger) so multi-part icons build up piece by piece.
 *
 * Usage:  <LineIcon icon={PiggyBank} className="size-12" strokeWidth={1.75} delay={0.2} />
 */

// every kind of line a lucide icon can be made of
const SHAPES = 'path, circle, rect, line, polyline, polygon, ellipse'

// pattern "1 1.5" = 1 unit of line, then a 1.5 unit gap. With pathLength=1 the whole icon line is 1 unit long,
// so offset 1 = fully hidden, offset 0 = fully drawn.
const DASH = '1 1.5'

type LineIconProps = {
  icon: LucideIcon
  className?: string
  strokeWidth?: number
  /** seconds to wait before the first draw (after the icon scrolls into view) */
  delay?: number
  /** draw again when the mouse enters the card around the icon (the nearest ".group" parent) */
  replayOnHover?: boolean
}

export default function LineIcon({
  icon: Icon,
  className,
  strokeWidth = 1.75,
  delay = 0,
  replayOnHover = true,
}: LineIconProps) {
  const ref = useRef<SVGSVGElement>(null)
  const hasDrawn = useRef(false)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  // people who turned on "reduce motion" in their OS just see the finished icon
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const getShapes = () => Array.from(ref.current?.querySelectorAll<SVGElement>(SHAPES) ?? [])

  // runs before the first paint: hide every line so the finished icon never flashes on screen
  useLayoutEffect(() => {
    if (reduced) return
    getShapes().forEach((el) => {
      el.setAttribute('pathLength', '1')
      el.style.strokeDasharray = DASH
      el.style.strokeDashoffset = '1'
    })
  }, [reduced])

  // plays the drawing. startDelay = seconds before the first line starts.
  const draw = (startDelay: number) => {
    const shapes = getShapes()
    if (reduced || shapes.length === 0) return
    shapes.forEach((el) => (el.style.strokeDashoffset = '1')) // reset so a replay starts from empty
    animate(shapes, { strokeDashoffset: [1, 0] }, { duration: 0.9, ease: 'easeInOut', delay: stagger(0.14, { startDelay }) })
  }

  // first draw: when the icon scrolls into view
  useEffect(() => {
    if (!inView || hasDrawn.current) return
    hasDrawn.current = true
    draw(delay)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  // replay: when the mouse enters the surrounding card
  useEffect(() => {
    if (!replayOnHover || reduced) return
    const svg = ref.current
    if (!svg) return
    const host = svg.closest('.group') ?? svg
    const onEnter = () => hasDrawn.current && draw(0)
    host.addEventListener('mouseenter', onEnter)
    return () => host.removeEventListener('mouseenter', onEnter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayOnHover, reduced])

  return <Icon ref={ref} className={className} strokeWidth={strokeWidth} aria-hidden />
}

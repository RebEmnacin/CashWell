import type { LucideIcon } from 'lucide-react'
import { animate, stagger, useInView } from 'motion/react'
import { useEffect, useLayoutEffect, useRef } from 'react'

type Props = {
  icon: LucideIcon
  className?: string
  strokeWidth?: number
  /** seconds to wait before the first draw (use it to stagger icons that sit next to each other) */
  delay?: number
}

// Every line inside the icon's <svg>
const SHAPES = 'path, circle, rect, line, polyline, polygon, ellipse'

/**
 * Line-art icon that DRAWS ITSELF.
 *  - when it scrolls into view: each stroke is drawn from nothing to complete, one after another
 *  - when you hover the card it sits in (any parent with the `group` class, or the icon itself): it redraws
 *
 * How it works: SVG lines can be hidden with stroke-dasharray + stroke-dashoffset.
 * Setting pathLength="1" on a line makes "1" mean "the whole line", so animating
 * the offset from 1 → 0 reveals the line from start to end.
 */
export default function AnimatedIcon({ icon: Icon, className, strokeWidth = 1.75, delay = 0 }: Props) {
  const box = useRef<HTMLSpanElement>(null)
  const inView = useInView(box, { once: true, margin: '-60px' })
  const running = useRef<ReturnType<typeof animate> | null>(null)

  const getShapes = () => Array.from(box.current?.querySelectorAll<SVGGeometryElement>(SHAPES) ?? [])

  const draw = (wait: number) => {
    const shapes = getShapes()
    if (!shapes.length) return
    running.current?.stop()
    // start from "nothing drawn"
    shapes.forEach((s) => {
      s.style.strokeDashoffset = '1'
    })
    running.current = animate(
      shapes,
      { strokeDashoffset: [1, 0] },
      { duration: 0.85, ease: 'easeInOut', delay: stagger(0.14, { startDelay: wait }) },
    )
  }

  // before paint: prepare every line as "hidden" so the finished icon never flashes first
  useLayoutEffect(() => {
    getShapes().forEach((s) => {
      s.setAttribute('pathLength', '1')
      s.style.strokeDasharray = '1'
      s.style.strokeDashoffset = '1'
    })
  }, [])

  // first draw, when it scrolls into view
  useEffect(() => {
    if (inView) draw(delay)
  }, [inView]) // eslint-disable-line react-hooks/exhaustive-deps

  // redraw on hover (the card around it, or the icon itself)
  useEffect(() => {
    const el = box.current
    if (!el) return
    const target = el.closest<HTMLElement>('.group') ?? el
    const onEnter = () => {
      if (inView) draw(0)
    }
    target.addEventListener('mouseenter', onEnter)
    return () => target.removeEventListener('mouseenter', onEnter)
  }, [inView]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => running.current?.stop(), [])

  return (
    <span ref={box} className="inline-grid place-items-center" aria-hidden="true">
      <Icon className={className} strokeWidth={strokeWidth} />
    </span>
  )
}

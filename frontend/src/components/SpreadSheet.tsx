/**
 * A coloured sheet behind a section that starts as a small ROUNDED panel and, as you scroll to it, SPREADS out to
 * the edges of the screen while its rounded corners flatten to sharp ones. (The same move as the "Who it's for"
 * sheet on HireRise.)
 *
 * Like every scroll effect here it plays once: scrolling back up does not shrink it again.
 */
import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { useLatched } from './Scrub'

export default function SpreadSheet({
  children,
  className = '',
  inset = '5%', // how far in from each side it starts
  radius = 56, // px: the rounded corners it starts with
  offset = ['start end', 'start 0.3'],
}: {
  children: ReactNode
  className?: string
  inset?: string
  radius?: number
  offset?: [string, string]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: offset as never })
  const p = useSpring(useLatched(scrollYProgress), { stiffness: 140, damping: 26, mass: 0.4 })
  const margin = useTransform(p, [0, 1], [inset, '0%'])
  const corner = useTransform(p, [0, 1], [`${radius}px`, '0px'])
  return (
    <motion.div ref={ref} style={{ marginLeft: margin, marginRight: margin, borderRadius: corner }} className={className}>
      {children}
    </motion.div>
  )
}

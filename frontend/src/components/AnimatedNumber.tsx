import { animated, useSpring } from '@react-spring/web'

interface Props {
  value: number
  format: (n: number) => string
}

/** Counts up smoothly to `value` using react-spring whenever the number changes. */
export default function AnimatedNumber({ value, format }: Props) {
  const { n } = useSpring({
    from: { n: 0 },
    to: { n: value },
    config: { tension: 110, friction: 22 },
  })
  return <animated.span>{n.to((v) => format(v))}</animated.span>
}

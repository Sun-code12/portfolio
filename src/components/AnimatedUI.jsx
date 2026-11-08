import { createContext, useContext, useEffect, useRef } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'

const MotionPreferenceContext = createContext(null)

export function MotionPreferenceProvider({ children, reducedMotion }) {
  return (
    <MotionPreferenceContext.Provider value={reducedMotion}>
      {children}
    </MotionPreferenceContext.Provider>
  )
}

export function usePortfolioReducedMotion() {
  const preference = useContext(MotionPreferenceContext)
  const systemPreference = useReducedMotion()
  return preference ?? systemPreference
}

export const revealVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
}

export const staggerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
}

export function Reveal({ children, className = '' }) {
  const reducedMotion = usePortfolioReducedMotion()

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reducedMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function RevealSection({ children, className = '', id }) {
  const reducedMotion = usePortfolioReducedMotion()

  return (
    <motion.section
      className={className}
      id={id}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reducedMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  )
}

export function StaggerItem({ children, className = '' }) {
  const reducedMotion = usePortfolioReducedMotion()

  return (
    <motion.div
      className={className}
      variants={reducedMotion
        ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0 } } }
        : revealVariants}
    >
      {children}
    </motion.div>
  )
}

export function Magnetic({ children, className = '' }) {
  const reducedMotion = usePortfolioReducedMotion()
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const x = useSpring(pointerX, { stiffness: 260, damping: 20, mass: 0.35 })
  const y = useSpring(pointerY, { stiffness: 260, damping: 20, mass: 0.35 })

  function handlePointerMove(event) {
    if (reducedMotion || !window.matchMedia('(pointer: fine)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    pointerX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 9)
    pointerY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 7)
  }

  function reset() {
    pointerX.set(0)
    pointerY.set(0)
  }

  return (
    <motion.span
      className={`magnetic ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      style={{ x, y }}
    >
      {children}
    </motion.span>
  )
}

export function SectionHeading({ eyebrow, title, highlight, text }) {
  return (
    <Reveal className="mb-12 text-center">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-sky-500">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {title} <span className="gradient-text">{highlight}</span>
      </h2>
      {text && <p className="muted mt-3">{text}</p>}
    </Reveal>
  )
}

export function SpotlightTiltCard({
  children,
  className = '',
  onClick,
  onKeyDown,
  role,
  tabIndex,
  ...props
}) {
  const cardRef = useRef(null)
  const reducedMotion = usePortfolioReducedMotion()
  const tiltStrength = reducedMotion ? 0 : 7
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [tiltStrength, -tiltStrength]), {
    stiffness: 210,
    damping: reducedMotion ? 32 : 22,
  })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-tiltStrength, tiltStrength]), {
    stiffness: 210,
    damping: reducedMotion ? 32 : 22,
  })

  function handlePointerMove(event) {
    const card = cardRef.current
    if (!card) return

    const bounds = card.getBoundingClientRect()
    const localX = event.clientX - bounds.left
    const localY = event.clientY - bounds.top
    card.style.setProperty('--pointer-x', `${localX}px`)
    card.style.setProperty('--pointer-y', `${localY}px`)
    card.style.setProperty('--spotlight-opacity', '1')

    if (!reducedMotion && event.pointerType === 'mouse') {
      x.set(localX / bounds.width - 0.5)
      y.set(localY / bounds.height - 0.5)
    }
  }

  function handlePointerLeave() {
    x.set(0)
    y.set(0)
    cardRef.current?.style.setProperty('--spotlight-opacity', '0')
  }

  return (
    <motion.div
      {...props}
      ref={cardRef}
      className={`spotlight-card ${className}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      role={role}
      tabIndex={tabIndex}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      whileHover={reducedMotion ? undefined : { y: -8, scale: 1.02 }}
      whileTap={reducedMotion ? undefined : { scale: 0.98 }}
    >
      {children}
    </motion.div>
  )
}

export function ParticleCanvas() {
  const canvasRef = useRef(null)
  const reducedMotion = usePortfolioReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return undefined

    const pointer = { x: -1000, y: -1000, active: false }
    let particles = []
    let frameId = 0
    let width = 0
    let height = 0

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * ratio
      canvas.height = height * ratio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      const count = Math.min(68, Math.max(30, Math.floor((width * height) / 23000)))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        radius: Math.random() * 1.6 + 0.8,
      }))
    }

    function handleResize() {
      resize()
      if (reducedMotion) draw()
    }

    function handlePointerMove(event) {
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.active = true
      if (reducedMotion) {
        window.cancelAnimationFrame(frameId)
        frameId = window.requestAnimationFrame(draw)
      }
    }

    function handlePointerOut(event) {
      if (!event.relatedTarget) pointer.active = false
    }

    function draw() {
      context.clearRect(0, 0, width, height)
      particles.forEach((particle, index) => {
        if (!reducedMotion) {
          particle.x += particle.vx
          particle.y += particle.vy
          if (particle.x < 0 || particle.x > width) particle.vx *= -1
          if (particle.y < 0 || particle.y > height) particle.vy *= -1
        }

        if (pointer.active) {
          const dx = particle.x - pointer.x
          const dy = particle.y - pointer.y
          const distance = Math.hypot(dx, dy)
          if (distance < 135 && distance > 0) {
            const force = (135 - distance) / 135
            if (reducedMotion) {
              particle.x += (dx / distance) * force * 0.12
              particle.y += (dy / distance) * force * 0.12
            } else {
              particle.vx += (dx / distance) * force * 0.0015
              particle.vy += (dy / distance) * force * 0.0015
            }
          }
        }

        particle.vx *= 0.998
        particle.vy *= 0.998
        particle.vx = Math.max(-0.45, Math.min(0.45, particle.vx))
        particle.vy = Math.max(-0.45, Math.min(0.45, particle.vy))

        context.beginPath()
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        context.fillStyle = 'rgba(14, 165, 233, 0.42)'
        context.fill()

        for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex++) {
          const next = particles[nextIndex]
          const distance = Math.hypot(particle.x - next.x, particle.y - next.y)
          if (distance < 105) {
            context.beginPath()
            context.moveTo(particle.x, particle.y)
            context.lineTo(next.x, next.y)
            context.strokeStyle = `rgba(14, 165, 233, ${(1 - distance / 105) * 0.13})`
            context.lineWidth = 0.7
            context.stroke()
          }
        }
      })

      if (!reducedMotion) frameId = window.requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', handleResize)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerout', handlePointerOut)
    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerout', handlePointerOut)
    }
  }, [reducedMotion])

  return <canvas ref={canvasRef} aria-hidden="true" className="particle-canvas" />
}
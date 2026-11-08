import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Moon, Sparkles, Sun, Waves, X } from 'lucide-react'
import { NAV_ITEMS } from '../data/portfolio.js'
import { Magnetic } from './AnimatedUI.jsx'

function ThemeToggle({ dark, onToggleTheme, showLabel = false }) {
  return (
    <motion.button
      aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`}
      className={`theme-toggle rounded-full ${showLabel
        ? 'mobile-theme-toggle flex w-full items-center justify-between px-4 py-3 text-sm font-medium'
        : 'grid h-10 w-10 place-items-center'}`}
      onClick={onToggleTheme}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      type="button"
    >
      {showLabel && <span>Appearance</span>}
      <span className="inline-flex items-center gap-2">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={dark ? 'sun' : 'moon'}
            initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.6 }}
            transition={{ duration: 0.2 }}
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </motion.span>
        </AnimatePresence>
        {showLabel && <span>{dark ? 'Light mode' : 'Dark mode'}</span>}
      </span>
    </motion.button>
  )
}

function MotionToggle({ reducedMotion, onToggleMotion, showLabel = false }) {
  const Icon = reducedMotion ? Sparkles : Waves
  const label = reducedMotion ? 'Enable animations' : 'Reduce motion'

  return (
    <button
      aria-label={label}
      className={`motion-toggle rounded-full ${showLabel
        ? 'mobile-theme-toggle flex w-full items-center justify-between px-4 py-3 text-sm font-medium'
        : 'grid h-10 w-10 place-items-center'}`}
      onClick={onToggleMotion}
      title={label}
      type="button"
    >
      {showLabel && <span>Motion</span>}
      <span className="inline-flex items-center gap-2">
        <Icon size={19} />
        {showLabel && <span>{label}</span>}
      </span>
    </button>
  )
}

export default function PortfolioNav({
  dark,
  onToggleTheme,
  reducedMotion,
  onToggleMotion,
}) {
  const [active, setActive] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef(null)

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) =>
      document.getElementById(item.toLowerCase()),
    ).filter(Boolean)

    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (current) setActive(current.target.id)
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.15, 0.35, 0.6] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!menuOpen) return undefined

    function handleDismiss(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      } else if (
        event.type === 'pointerdown' &&
        headerRef.current &&
        !headerRef.current.contains(event.target)
      ) {
        setMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleDismiss)
    window.addEventListener('pointerdown', handleDismiss)
    return () => {
      window.removeEventListener('keydown', handleDismiss)
      window.removeEventListener('pointerdown', handleDismiss)
    }
  }, [menuOpen])

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-3 z-50 px-3">
      <div className="nav-glass mx-auto flex max-w-5xl items-center justify-between rounded-full px-4 py-2.5 sm:px-5">
        <a
          className="brand-title gradient-text text-lg font-bold"
          href="#home"
          onClick={() => {
            setActive('home')
            setMenuOpen(false)
          }}
        >
          Portfolio.
        </a>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 text-[13px] font-medium lg:flex">
          {NAV_ITEMS.map((item) => {
            const id = item.toLowerCase()
            const isActive = active === id
            return (
              <Magnetic key={id}>
                <a
                  aria-current={isActive ? 'location' : undefined}
                  className={`nav-link relative inline-block rounded-full px-2.5 py-2 transition-colors sm:px-3 ${isActive ? 'text-sky-600 dark:text-sky-300' : ''}`}
                  href={`#${id}`}
                >
                  {item}
                  {isActive && (
                    <motion.span
                      className="nav-indicator"
                      layoutId="active-nav-indicator"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                </a>
              </Magnetic>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Magnetic>
            <ThemeToggle dark={dark} onToggleTheme={onToggleTheme} />
          </Magnetic>

          <MotionToggle
            reducedMotion={reducedMotion}
            onToggleMotion={onToggleMotion}
          />

          <Magnetic className="lg:hidden">
            <motion.button
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="theme-toggle grid h-10 w-10 place-items-center rounded-full"
              onClick={() => setMenuOpen((value) => !value)}
              whileTap={{ scale: 0.9 }}
              type="button"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={menuOpen ? 'close' : 'menu'}
                  initial={{ opacity: 0, rotate: -45 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 45 }}
                  transition={{ duration: 0.16 }}
                >
                  {menuOpen ? <X size={19} /> : <Menu size={19} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </Magnetic>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="nav-glass mx-auto mt-2 flex max-w-5xl flex-col gap-1 rounded-3xl p-3 lg:hidden"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            {NAV_ITEMS.map((item) => {
              const id = item.toLowerCase()
              return (
                <Magnetic key={id} className="mobile-nav-item">
                  <a
                    aria-current={active === id ? 'location' : undefined}
                    className={`mobile-nav-link block rounded-xl px-4 py-2.5 text-left text-sm transition-colors hover:bg-sky-100 dark:hover:bg-slate-800 ${active === id ? 'text-sky-600 dark:text-sky-300' : ''}`}
                    href={`#${id}`}
                    onClick={() => {
                      setActive(id)
                      setMenuOpen(false)
                    }}
                  >
                    {item}
                  </a>
                </Magnetic>
              )
            })}
            <div className="mobile-menu-divider my-1" />
            <ThemeToggle dark={dark} onToggleTheme={onToggleTheme} showLabel />
            <MotionToggle
              reducedMotion={reducedMotion}
              onToggleMotion={onToggleMotion}
              showLabel
            />
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
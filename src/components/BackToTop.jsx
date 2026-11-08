import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { usePortfolioReducedMotion } from './AnimatedUI.jsx'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)
  const reducedMotion = usePortfolioReducedMotion()

  useEffect(() => {
    function updateVisibility() {
      setVisible(window.scrollY > 300)
    }

    updateVisibility()
    window.addEventListener('scroll', updateVisibility, { passive: true })
    return () => window.removeEventListener('scroll', updateVisibility)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          aria-label="Back to top"
          className="back-to-top"
          initial={{ opacity: 0, y: 18, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.8 }}
          transition={{ duration: 0.22 }}
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: reducedMotion ? 'instant' : 'smooth',
            })
          }
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.92 }}
          type="button"
        >
          <ArrowUp size={19} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
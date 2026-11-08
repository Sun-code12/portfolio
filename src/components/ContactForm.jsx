import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Send } from 'lucide-react'

const CONFETTI = Array.from({ length: 28 }, (_, index) => {
  const angle = (index / 28) * Math.PI * 2
  const distance = 55 + ((index * 37) % 100)
  return {
    id: index,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance - 24,
    color: ['#0ea5e9', '#06b6d4', '#818cf8', '#34d399', '#fbbf24'][index % 5],
  }
})

export default function ContactForm() {
  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [submissionStatus, setSubmissionStatus] = useState('idle')
  const [submissionMessage, setSubmissionMessage] = useState('')
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setSubmissionStatus('idle')
    setSubmissionMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!values.name.trim()) nextErrors.name = 'Please enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!values.message.trim()) nextErrors.message = 'Please write a message.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setSubmissionStatus('idle')
      setSubmissionMessage('')
      return
    }

    if (!accessKey) {
      setSubmissionStatus('error')
      setSubmissionMessage(
        'The contact form is not configured yet. Add your Web3Forms access key to VITE_WEB3FORMS_ACCESS_KEY.',
      )
      return
    }

    setSubmissionStatus('sending')
    setSubmissionMessage('')

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `New portfolio message from ${values.name.trim()}`,
          from_name: values.name.trim(),
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          botcheck: '',
        }),
      })
      let result
      try {
        result = await response.json()
      } catch {
        throw new Error('The email service returned an unreadable response.')
      }

      if (!response.ok || result?.success !== true) {
        setSubmissionStatus('error')
        setSubmissionMessage(
          result?.message || 'Your message could not be sent. Please try again later.',
        )
        return
      }

      setSubmissionStatus('success')
      setSubmissionMessage(`Thanks, ${values.name.trim()}! Your message has been sent.`)
      setValues({ name: '', email: '', message: '' })
      setErrors({})
    } catch (error) {
      console.error('Unable to submit the Web3Forms contact form.', error)
      setSubmissionStatus('error')
      setSubmissionMessage(
        error instanceof TypeError
          ? 'We could not connect to the email service. Check your connection and try again.'
          : error.message,
      )
    }
  }

  const submitted = submissionStatus === 'success'

  return (
    <div className="relative">
      <AnimatePresence>
        {submitted && (
          <motion.div
            key="confetti"
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 overflow-hidden"
          >
            {CONFETTI.map(({ id, x, y, color }) => (
              <motion.span
                key={id}
                className="confetti-piece"
                style={{ backgroundColor: color }}
                initial={{ opacity: 1, x: 0, y: 14, rotate: 0, scale: 0.4 }}
                animate={{ opacity: [1, 1, 0], x, y, rotate: 520, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.15, ease: 'easeOut' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form
        className="card grid gap-5 rounded-3xl p-6 sm:p-8"
        onSubmit={handleSubmit}
        noValidate
        aria-busy={submissionStatus === 'sending'}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.55 }}
      >
        <FloatingField
          autoComplete="name"
          error={errors.name}
          label="Your name"
          name="name"
          onChange={handleChange}
          value={values.name}
        />
        <FloatingField
          autoComplete="email"
          error={errors.email}
          label="Your email"
          name="email"
          onChange={handleChange}
          type="email"
          value={values.email}
        />
        <FloatingField
          error={errors.message}
          label="Your message"
          name="message"
          onChange={handleChange}
          multiline
          value={values.message}
        />
        <input
          aria-hidden="true"
          autoComplete="off"
          className="hidden"
          name="botcheck"
          tabIndex={-1}
          type="checkbox"
        />

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              aria-live="polite"
              className="form-feedback form-success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Check size={17} />
              </span>
              <strong>{submissionMessage}</strong>
            </motion.div>
          ) : submissionStatus === 'error' ? (
            <motion.p
              key="submission-error"
              aria-live="polite"
              className="form-feedback form-error"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              {submissionMessage}
            </motion.p>
          ) : errors.name || errors.email || errors.message ? (
            <motion.p
              key="validation"
              aria-live="polite"
              className="form-feedback form-error"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              Please fix the highlighted fields to continue.
            </motion.p>
          ) : null}
        </AnimatePresence>

        <motion.button
          className="gradient-button inline-flex items-center gap-2 justify-self-start rounded-full px-8 py-3 font-semibold"
          type="submit"
          disabled={submissionStatus === 'sending'}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          {submissionStatus === 'sending' ? 'Sending…' : 'Send message'}
          <Send size={16} />
        </motion.button>
      </motion.form>
    </div>
  )
}

function FloatingField({
  autoComplete,
  error,
  label,
  multiline = false,
  name,
  onChange,
  type = 'text',
  value,
}) {
  const id = `contact-${name}`
  const errorId = `${id}-error`
  const commonProps = {
    'aria-describedby': error ? errorId : undefined,
    'aria-invalid': Boolean(error),
    autoComplete,
    id,
    name,
    onChange,
    placeholder: ' ',
    required: true,
    value,
  }

  return (
    <div className="floating-field">
      {multiline ? <textarea {...commonProps} rows="5" /> : <input {...commonProps} type={type} />}
      <label htmlFor={id}>{label}</label>
      {error && <p className="field-error" id={errorId}>{error}</p>}
    </div>
  )
}
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Send } from 'lucide-react'
import { ValidationError, useForm } from '@formspree/react'

const FORMSPREE_FORM_ID = 'mppdpnnq'

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
  const [successName, setSuccessName] = useState('')
  const submittedName = useRef('')
  const [state, formspreeSubmit, resetForm] = useForm(FORMSPREE_FORM_ID)

  useEffect(() => {
    if (state.succeeded) {
      setValues({ name: '', email: '', message: '' })
      setErrors({})
      setSuccessName(submittedName.current)
    }
  }, [state.succeeded])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    if (state.succeeded || state.errors) resetForm()
  }

  function handleSubmit(event) {
    if (state.succeeded) resetForm()

    const nextErrors = {}
    if (!values.name.trim()) nextErrors.name = 'Please enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!values.message.trim()) nextErrors.message = 'Please write a message.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      event.preventDefault()
      return
    }

    submittedName.current = values.name.trim()
    setErrors({})
    return formspreeSubmit(event)
  }

  const submitted = state.succeeded

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
        aria-busy={state.submitting}
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
          disabled={state.submitting}
          serverErrors={state.errors}
          value={values.name}
        />
        <FloatingField
          autoComplete="email"
          error={errors.email}
          label="Your email"
          name="email"
          onChange={handleChange}
          disabled={state.submitting}
          serverErrors={state.errors}
          type="email"
          value={values.email}
        />
        <FloatingField
          error={errors.message}
          label="Your message"
          name="message"
          onChange={handleChange}
          multiline
          disabled={state.submitting}
          serverErrors={state.errors}
          value={values.message}
        />

        <AnimatePresence mode="wait">
          {errors.name || errors.email || errors.message ? (
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
          ) : state.errors ? (
            <motion.div
              key="submission-error"
              aria-live="polite"
              className="form-feedback form-error"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <ValidationError errors={state.errors} />
            </motion.div>
          ) : submitted ? (
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
              <strong>
                Thanks{successName ? `, ${successName}` : ''}! Your message has been sent.
              </strong>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.button
          className="gradient-button inline-flex items-center gap-2 justify-self-start rounded-full px-8 py-3 font-semibold"
          type="submit"
          disabled={state.submitting}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          {state.submitting ? 'Sending…' : 'Send message'}
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
  serverErrors,
  disabled,
  type = 'text',
  value,
}) {
  const id = `contact-${name}`
  const errorId = `${id}-server-error`
  const localErrorId = `${id}-local-error`
  const hasServerError = Boolean(serverErrors?.getFieldErrors(name).length)
  const commonProps = {
    'aria-describedby': [error && localErrorId, hasServerError && errorId]
      .filter(Boolean)
      .join(' ') || undefined,
    'aria-invalid': Boolean(error || hasServerError),
    autoComplete,
    id,
    name,
    onChange,
    placeholder: ' ',
    required: true,
    disabled,
    value,
  }

  return (
    <div className="floating-field">
      {multiline ? <textarea {...commonProps} rows="5" /> : <input {...commonProps} type={type} />}
      <label htmlFor={id}>{label}</label>
      {error && <p className="field-error" id={localErrorId}>{error}</p>}
      <ValidationError
        className="field-error"
        id={errorId}
        field={name}
        errors={serverErrors}
        prefix={label}
      />
    </div>
  )
}
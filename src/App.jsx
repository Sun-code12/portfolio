import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  EXPERIENCE,
  LANGUAGES,
  PROFILE,
  PROJECTS,
  SOCIALS,
  TECH,
} from './data/portfolio.js'
import {
  MotionPreferenceProvider,
  ParticleCanvas,
  Reveal,
  RevealSection,
  SectionHeading,
  StaggerItem,
  staggerVariants,
  Magnetic,
} from './components/AnimatedUI.jsx'
import BackToTop from './components/BackToTop.jsx'
import BrandIcon from './components/BrandIcon.jsx'
import ContactForm from './components/ContactForm.jsx'
import PortfolioNav from './components/PortfolioNav.jsx'
import ProjectGallery from './components/ProjectGallery.jsx'
import SkillsGrid from './components/SkillsGrid.jsx'

const PHRASES = [
  'Creativity is my passion',
  'Front-end developer',
  'WordPress developer',
]

function getInitialTheme() {
  try {
    const savedTheme = window.localStorage.getItem('theme')
    if (savedTheme) return savedTheme === 'dark'
  } catch {
    // Theme switching remains available without browser storage.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function getMotionOverride() {
  try {
    const preference = window.localStorage.getItem('motion-preference')
    return preference === 'full' || preference === 'reduce' ? preference : null
  } catch {
    return null
  }
}

function SocialLinks({ centered = false }) {
  return (
    <div className={`flex gap-3 ${centered ? 'justify-center' : ''}`}>
      {SOCIALS.map(({ label, href }) => {
        return (
          <Magnetic key={label}>
            <a
              aria-label={label}
              className="social-link card flex h-11 w-11 items-center justify-center rounded-full"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <BrandIcon brand={label} />
            </a>
          </Magnetic>
        )
      })}
    </div>
  )
}

function TypingLine() {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const phrase = PHRASES[phraseIndex]
    const delay =
      !deleting && text === phrase
        ? 1400
        : deleting && text === ''
          ? 350
          : deleting
            ? 45
            : 85

    const timeout = window.setTimeout(() => {
      if (!deleting && text === phrase) {
        setDeleting(true)
      } else if (deleting && text === '') {
        setDeleting(false)
        setPhraseIndex((index) => (index + 1) % PHRASES.length)
      } else if (deleting) {
        setText(phrase.slice(0, text.length - 1))
      } else {
        setText(phrase.slice(0, text.length + 1))
      }
    }, delay)
    return () => window.clearTimeout(timeout)
  }, [deleting, phraseIndex, text])

  return (
    <span className="gradient-text">
      {text}
      <span className="typing-cursor" aria-hidden="true">|</span>
    </span>
  )
}

function LanguageCard({ code, name, level }) {
  const circumference = 2 * Math.PI * 44
  const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const progress = typeof level === 'number'
    ? level
    : ((cefrLevels.indexOf(level) + 1) / cefrLevels.length) * 100

  return (
    <motion.div
      aria-label={`${name}, ${typeof level === 'number' ? `${level}%` : `CEFR ${level}`}`}
      className="card w-40 rounded-3xl p-6 text-center"
      variants={{
        hidden: { opacity: 0, y: 18 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      <div className="relative mx-auto h-28 w-28">
        <svg viewBox="0 0 100 100" className="-rotate-90">
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeOpacity=".12"
            strokeWidth="8"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#06b6d4"
            strokeDasharray={circumference}
            strokeLinecap="round"
            strokeWidth="8"
            initial={{ strokeDashoffset: circumference }}
            whileInView={{
              strokeDashoffset: circumference * (1 - progress / 100),
            }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div>
            <div className="text-xl font-bold">{code}</div>
            <div className="gradient-text text-xs font-semibold">
              {typeof level === 'number' ? `${level}%` : level}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 font-semibold">{name}</div>
    </motion.div>
  )
}

export default function App() {
  const [dark, setDark] = useState(getInitialTheme)
  const [motionOverride, setMotionOverride] = useState(getMotionOverride)
  const [systemReducedMotion, setSystemReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const reducedMotion = motionOverride
    ? motionOverride === 'reduce'
    : systemReducedMotion

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', dark ? '#0b1220' : '#eff9ff')
    try {
      window.localStorage.setItem('theme', dark ? 'dark' : 'light')
    } catch {
      // Theme selection still works for the current page.
    }
  }, [dark])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateSystemPreference = (event) => setSystemReducedMotion(event.matches)
    preference.addEventListener('change', updateSystemPreference)
    return () => preference.removeEventListener('change', updateSystemPreference)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion ? 'reduce' : 'full'
    try {
      if (motionOverride) {
        window.localStorage.setItem('motion-preference', motionOverride)
      } else {
        window.localStorage.removeItem('motion-preference')
      }
    } catch {
      // Motion preference still applies for the current page.
    }
  }, [motionOverride, reducedMotion])

  return (
    <MotionPreferenceProvider reducedMotion={reducedMotion}>
    <div className="relative isolate min-h-screen overflow-hidden">
      <ParticleCanvas />
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="ambient ambient-three" aria-hidden="true" />

      <PortfolioNav
        dark={dark}
        onToggleTheme={() => setDark((value) => !value)}
        reducedMotion={reducedMotion}
        onToggleMotion={() => setMotionOverride(reducedMotion ? 'full' : 'reduce')}
      />

      <main className="relative z-10">
        <section className="px-5 pb-20 pt-32 sm:pt-40" id="home">
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
            <Reveal className="order-2 text-center md:order-1 md:text-left">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/70 px-4 py-2 text-xs font-semibold text-sky-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-sky-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Learning, building &amp; growing
              </div>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
                Hi, I’m <span className="gradient-text">{PROFILE.name}</span>
              </h1>
              <p className="mt-4 text-xl font-semibold sm:text-2xl">
                “<TypingLine />”
              </p>
              <p className="muted mx-auto mt-5 max-w-lg leading-7 md:mx-0">
                Passionate 11th-grade student and front-end developer from
                Afghanistan, building clean, intuitive, and
                responsive web experiences.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
                <Magnetic>
                  <a className="gradient-button inline-block rounded-full px-7 py-3 font-semibold" href="#work">
                    Explore my work <span aria-hidden="true">↗</span>
                  </a>
                </Magnetic>
                <Magnetic>
                  <a
                    className="card inline-block rounded-full px-7 py-3 font-semibold text-sky-700 dark:text-sky-300"
                    href="#contact"
                  >
                    Contact me
                  </a>
                </Magnetic>
              </div>
              <div className="mt-7 flex justify-center md:justify-start">
                <SocialLinks />
              </div>
            </Reveal>

            <Reveal className="order-1 grid place-items-center md:order-2">
              <div className="hero-portrait relative grid h-72 w-72 place-items-center sm:h-96 sm:w-96">
                <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 opacity-40 blur-2xl" />
                <div className="hero-avatar-ring relative h-56 w-56 rounded-full p-[3px] sm:h-80 sm:w-80">
                  <img
                    alt="Illustrated portrait of Khorshid Shira"
                    className="relative z-10 h-full w-full rounded-full border-[6px] border-white bg-white object-cover shadow-2xl dark:border-slate-700 dark:bg-slate-700"
                    fetchpriority="high"
                    src="/images/hero.jpg"
                  />
                </div>
                {[
                  { label: 'React' },
                  { label: 'Tailwind CSS' },
                  { label: 'WordPress' },
                  { label: 'JavaScript' },
                  { label: 'TypeScript' },
                  { label: 'Git' },
                ].map((technology, index) => (
                  <div
                    key={technology.label}
                    className="orbit"
                    style={{ animationDelay: `${-(index * 18) / 6}s` }}
                  >
                    <span
                      aria-label={technology.label}
                      role="img"
                      style={{ animationDelay: `${-(index * 18) / 6}s` }}
                      title={technology.label}
                    >
                      {technology.label}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <div aria-label="Technology skills" className="tech-marquee-window overflow-hidden py-4">
          <div className="tech-marquee">
            {[0, 1].map((group) => (
              <div
                aria-hidden={group === 1}
                className="tech-marquee-group"
                key={group}
              >
                {TECH.map((technology) => (
                  <span
                    key={technology}
                    className="card whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium"
                  >
                    {technology}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <RevealSection className="px-5 py-24" id="about">
          <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
            <Reveal>
              <div className="grid place-items-center">
                <div className="h-96 w-60 overflow-hidden rounded-[48%] border-4 border-white bg-gradient-to-b from-sky-200 to-cyan-100 shadow-2xl dark:border-slate-700 dark:from-slate-800 dark:to-indigo-950">
                  <img
                    alt="Full-length illustrated portrait of Khorshid"
                    className="h-full w-full object-cover object-top"
                    loading="lazy"
                    src="/images/about.jpg"
                  />
                </div>
              </div>
            </Reveal>
            <Reveal>
              <h2 className="text-3xl font-semibold sm:text-4xl">
                About <span className="gradient-text">me</span>
              </h2>
              <p className="muted mt-5 leading-7">
                I’m a front-end developer who loves turning ideas into clean,
                responsive interfaces. I work with HTML5, CSS3,
                JavaScript, TypeScript, React, Tailwind CSS, and WordPress.
              </p>
              <p className="muted mt-3 leading-7">
                Alongside coding, I’m improving my English every day and
                building my project portfolio on GitHub. I’m always looking for
                opportunities to learn, collaborate, and grow.
              </p>
              <div className="mt-7 grid grid-cols-3 gap-3 text-center">
                {[
                  [String(PROJECTS.length), 'Projects'],
                  ['10', 'Technologies'],
                  ['100%', 'Committed'],
                ].map(([value, label]) => (
                  <div key={label} className="card rounded-2xl p-3">
                    <div className="gradient-text text-2xl font-extrabold">{value}</div>
                    <div className="muted text-[11px]">{label}</div>
                  </div>
                ))}
              </div>
              <a className="gradient-button mt-7 inline-block rounded-full px-7 py-3 font-semibold" href="#contact">
                Let’s connect
              </a>
            </Reveal>
          </div>
        </RevealSection>

        <RevealSection className="mx-auto max-w-6xl px-5 py-20" id="experience">
          <SectionHeading
            eyebrow="My journey"
            title="My"
            highlight="experience"
            text="Learning at every step"
          />
          <motion.div
            className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]"
            variants={staggerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
          >
            <div className="grid gap-5">
              {[0, 2].map((index) => (
                <StaggerItem key={EXPERIENCE[index].title}>
                  <ExperienceCard item={EXPERIENCE[index]} side="left" />
                </StaggerItem>
              ))}
            </div>
            <StaggerItem>
              <div className="mx-auto h-56 w-44 overflow-hidden rounded-3xl shadow-xl">
                <img
                  alt=""
                  className="h-full w-full object-cover object-top"
                  loading="lazy"
                  src="/images/hero.jpg"
                />
              </div>
            </StaggerItem>
            <div className="grid gap-5">
              {[1, 3].map((index) => (
                <StaggerItem key={EXPERIENCE[index].title}>
                  <ExperienceCard item={EXPERIENCE[index]} side="right" />
                </StaggerItem>
              ))}
            </div>
          </motion.div>
        </RevealSection>

        <SkillsGrid />

        <RevealSection className="mx-auto max-w-4xl px-5 py-20" id="languages">
          <SectionHeading
            eyebrow="What I speak"
            title="My"
            highlight="languages"
            text="Communicating with the world"
          />
          <motion.div
            className="flex flex-wrap justify-center gap-6"
            variants={staggerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {LANGUAGES.map((language) => (
              <LanguageCard key={language.code} {...language} />
            ))}
          </motion.div>
        </RevealSection>

        <RevealSection className="mx-auto max-w-6xl px-5 py-20" id="work">
          <SectionHeading
            eyebrow="Selected projects"
            title="Recent"
            highlight="work"
            text="Filter, explore, and preview the things I’ve been building"
          />
          <ProjectGallery />
        </RevealSection>

        <RevealSection className="mx-auto max-w-4xl px-5 py-20" id="contact">
          <SectionHeading
            eyebrow="Say hello"
            title="Contact"
            highlight="me"
            text="Let’s build something together"
          />
          <ContactForm />
          <div className="mt-8">
            <SocialLinks centered />
          </div>
        </RevealSection>
      </main>

      <footer className="relative z-10 px-5 py-10 text-center text-sm">
        <div className="mb-4"><SocialLinks centered /></div>
        <p className="muted">
          © {new Date().getFullYear()} {PROFILE.name} · Creativity is my passion
        </p>
      </footer>

      <BackToTop />
    </div>
    </MotionPreferenceProvider>
  )
}

function ExperienceCard({ item, side }) {
  return (
    <article
      className={`card rounded-2xl p-5 ${
        side === 'left' ? 'border-l-4 border-sky-400' : 'border-r-4 border-cyan-400'
      }`}
    >
      <h3 className="font-bold">{item.title}</h3>
      <p className="mt-1 text-sm text-sky-500">{item.detail}</p>
      <p className="muted mt-2 text-sm leading-6">{item.description}</p>
    </article>
  )
}

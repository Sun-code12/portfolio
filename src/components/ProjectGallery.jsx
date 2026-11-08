import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useInView,
} from 'framer-motion'
import { ArrowUpRight, Code2, ExternalLink, X } from 'lucide-react'
import { PROJECTS } from '../data/portfolio.js'
import {
  Reveal,
  SpotlightTiltCard,
  Magnetic,
  usePortfolioReducedMotion,
} from './AnimatedUI.jsx'

const CATEGORIES = ['All', 'React', 'WordPress', 'Front-End']

function ProjectArtwork({ project }) {
  const [imageFailed, setImageFailed] = useState(false)

  if (project.previewImage && !imageFailed) {
    return (
      <div className="project-artwork">
        <img
          alt={`${project.name} website screenshot`}
          className="project-artwork-image"
          loading="lazy"
          onError={() => setImageFailed(true)}
          src={project.previewImage}
        />
      </div>
    )
  }

  const artwork = project.artwork

  return (
    <div
      aria-label={`${project.name} website concept preview`}
      className={`project-artwork project-artwork--${artwork.theme}`}
      role="img"
    >
      <div className="project-artwork-bar" aria-hidden="true">
        <span />
        <span />
        <span />
        <div>{project.demoUrl || `${project.name.toLowerCase().replaceAll(' ', '-')}.design`}</div>
      </div>
      <div className="project-artwork-site">
        <div className="project-artwork-nav">
          <span className="project-artwork-brand">{artwork.brand}</span>
          <span className="project-artwork-links" aria-hidden="true">
            <span>STORY</span>
            <span>COLLECTION</span>
            <span>CONTACT</span>
          </span>
        </div>
        <div className="project-artwork-content">
          <div className="project-artwork-copy">
            <div className="project-artwork-eyebrow">{artwork.eyebrow}</div>
            <div className="project-artwork-headline">{artwork.headline}</div>
            <p className="project-artwork-description">{artwork.description}</p>
            <span className="project-artwork-cta">{artwork.action}</span>
          </div>
          <div
            aria-hidden="true"
            className="project-artwork-photo"
            style={{ backgroundImage: `url("${artwork.image}")` }}
          />
        </div>
      </div>
      <span className="project-artwork-concept-badge">Concept preview</span>
    </div>
  )
}

function ProjectPreview({ project }) {
  if (project.demoUrl) {
    return (
      <iframe
        className="h-full w-full border-0 bg-white"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-forms allow-scripts allow-popups"
        src={project.demoUrl}
        title={`${project.name} live demo`}
      />
    )
  }

  return (
    <ProjectArtwork project={project} />
  )
}

function ProjectModal({ project, onClose }) {
  const closeButtonRef = useRef(null)
  const reducedMotion = usePortfolioReducedMotion()

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      if (previousFocus instanceof HTMLElement) previousFocus.focus()
    }
  }, [onClose])

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <motion.section
        aria-labelledby="project-modal-title"
        aria-modal="true"
        className="project-modal"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: reducedMotion ? 0 : 0.24 }}
        role="dialog"
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200/70 px-4 py-3 dark:border-slate-700 sm:px-6">
          <div className="min-w-0">
            <h2 id="project-modal-title" className="truncate font-semibold">{project.name}</h2>
            <p className="muted text-xs">{project.demoUrl ? 'Live demo preview' : 'Concept preview'}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              className="modal-action hidden sm:inline-flex"
              href={project.demoUrl || project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {project.demoUrl ? <ExternalLink size={15} /> : <Code2 size={15} />}
              {project.demoUrl ? 'Open live site' : 'View source'}
            </a>
            <button
              ref={closeButtonRef}
              aria-label="Close project preview"
              className="theme-toggle grid h-10 w-10 place-items-center rounded-full"
              onClick={onClose}
              type="button"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="project-preview-frame">
          <ProjectPreview project={project} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <p className="muted max-w-xl text-sm leading-6">{project.description}</p>
          <a
            className="modal-action sm:hidden"
            href={project.demoUrl || project.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {project.demoUrl ? 'Open live site' : 'View source'}
            <ArrowUpRight size={15} />
          </a>
        </div>
      </motion.section>
    </motion.div>
  )
}

function ProjectCard({ project, onSelect }) {
  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(project)
    }
  }

  return (
    <SpotlightTiltCard
      aria-haspopup="dialog"
      aria-label={`Preview ${project.name}`}
      className="project-card card flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl text-left"
      onClick={() => onSelect(project)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="project-card-preview">
        <ProjectArtwork project={project} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold">{project.name}</h3>
          <ArrowUpRight className="project-arrow mt-0.5 shrink-0 text-sky-500" size={17} />
        </div>
        <p className="muted mt-2 flex-1 text-sm leading-6">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Magnetic key={tag}>
              <span className="project-tag">{tag}</span>
            </Magnetic>
          ))}
        </div>
      </div>
    </SpotlightTiltCard>
  )
}

export default function ProjectGallery() {
  const [category, setCategory] = useState('All')
  const [selectedProject, setSelectedProject] = useState(null)
  const reducedMotion = usePortfolioReducedMotion()
  const gridRef = useRef(null)
  const gridInView = useInView(gridRef, { once: true, amount: 0.1 })
  const closeProject = useCallback(() => setSelectedProject(null), [])
  const filteredProjects = category === 'All'
    ? PROJECTS
    : PROJECTS.filter((project) => project.category === category)

  return (
    <div>
      <Reveal className="mb-7">
        <LayoutGroup>
          <div aria-label="Filter projects by category" className="flex flex-wrap justify-center gap-2" role="group">
            {CATEGORIES.map((item) => (
              <Magnetic key={item}>
                <button
                  aria-pressed={category === item}
                  className={`filter-pill ${category === item ? 'is-selected' : ''}`}
                  onClick={() => setCategory(item)}
                  type="button"
                >
                  {category === item && (
                    <motion.span
                      className="filter-pill-indicator"
                      layoutId="active-project-filter"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{item}</span>
                </button>
              </Magnetic>
            ))}
          </div>
        </LayoutGroup>
      </Reveal>

      <motion.div
        ref={gridRef}
        className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {filteredProjects.length ? filteredProjects.map((project) => (
            <motion.div
              key={project.name}
              layout
              initial={{ opacity: 0, y: reducedMotion ? 0 : 18, scale: 0.98 }}
              animate={
                gridInView
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: reducedMotion ? 0 : 18, scale: 0.98 }
              }
              exit={{ opacity: 0, y: reducedMotion ? 0 : -14, scale: 0.97 }}
              transition={{
                duration: reducedMotion ? 0 : 0.28,
                layout: { type: 'spring', stiffness: 340, damping: 30 },
              }}
            >
              <ProjectCard project={project} onSelect={setSelectedProject} />
            </motion.div>
          )) : (
            <motion.div
              key="wordpress-empty-state"
              className="empty-projects"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p className="font-semibold">WordPress projects coming soon.</p>
              <p className="muted mt-1 text-sm">I’m learning and building with WordPress—check back for projects.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            key={selectedProject.name}
            project={selectedProject}
            onClose={closeProject}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
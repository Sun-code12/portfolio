import {
  Atom,
  Braces,
  Code2,
  FileCode2,
  GitBranch,
  PanelsTopLeft,
  Wind,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { SKILLS } from '../data/portfolio.js'
import {
  SectionHeading,
  RevealSection,
  SpotlightTiltCard,
  StaggerItem,
  staggerVariants,
} from './AnimatedUI.jsx'

const ICONS = {
  Atom,
  Braces,
  Code2,
  FileCode2,
  GitBranch,
  PanelsTopLeft,
  Wind,
}

export default function SkillsGrid() {
  return (
    <RevealSection className="mx-auto max-w-6xl px-5 py-20" id="skills">
      <SectionHeading
        eyebrow="Tools of the trade"
        title="My"
        highlight="skills"
        text="The technologies I use to bring ideas to life"
      />
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={staggerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
      >
        {SKILLS.map((skill) => {
          const Icon = ICONS[skill.icon]
          return (
            <StaggerItem key={skill.name}>
              <SpotlightTiltCard className="skill-card card h-full rounded-2xl p-5">
                <div className="mb-6 flex items-start justify-between">
                  <span className="skill-icon grid h-11 w-11 place-items-center rounded-xl">
                    <Icon size={21} strokeWidth={1.8} />
                  </span>
                  <span className="skill-category">{skill.category}</span>
                </div>
                <h3 className="font-bold">{skill.name}</h3>
                <p className="muted mt-1 text-sm">{skill.detail}</p>
              </SpotlightTiltCard>
            </StaggerItem>
          )
        })}
      </motion.div>
    </RevealSection>
  )
}
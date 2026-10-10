'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Code2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { HeightRevealText, RevealWords } from '@/components/motion/RevealWords';
import { ScrambleText } from '@/components/motion/ScrambleText';
import { featuredProjects, moreProjects, type Project } from '@/data/site';

const genieCollapsed = 'polygon(50% 115%, 50% 115%, 50% 115%, 50% 115%, 50% 115%, 50% 115%, 50% 115%, 50% 115%, 50% 115%, 50% 115%, 50% 115%, 50% 115%)';
const genieOpening = [
  genieCollapsed,
  'polygon(48% 94%, 52% 94%, 52% 97%, 51.5% 101%, 51% 106%, 50.5% 111%, 50% 115%, 49.5% 111%, 49% 106%, 48.5% 101%, 48% 97%, 48% 94%)',
  'polygon(38% 70%, 62% 70%, 60% 78%, 57% 88%, 53.5% 99%, 51% 109%, 50% 115%, 49% 109%, 46.5% 99%, 43% 88%, 40% 78%, 38% 70%)',
  'polygon(0% 0%, 100% 0%, 96% 20%, 88% 40%, 72% 60%, 58% 82%, 50% 115%, 42% 82%, 28% 60%, 12% 40%, 4% 20%, 0% 0%)',
  'polygon(0% 0%, 100% 0%, 100% 20%, 100% 40%, 100% 60%, 100% 80%, 100% 100%, 0% 100%, 0% 80%, 0% 60%, 0% 40%, 0% 20%)',
];

function ProjectCard({ project, index, hoveredIndex, onHover, replayKey }: {
  project: Project;
  index: number;
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
  replayKey: number;
}) {
  const isActive = hoveredIndex === index;
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasRevealed, setHasRevealed] = useState(false);
  const revealDelay = hasRevealed ? index * 0.12 : 0;
  const fullCard = 'polygon(0% 0%, 100% 0%, 100% 20%, 100% 40%, 100% 60%, 100% 80%, 100% 100%, 0% 100%, 0% 80%, 0% 60%, 0% 40%, 0% 20%)';

  useEffect(() => {
    const card = cardRef.current;
    if (!card || reduceMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHasRevealed(true);
      },
      { rootMargin: '-15% 0px -15% 0px', threshold: 0.01 },
    );
    observer.observe(card);

    return () => observer.disconnect();
  }, [reduceMotion]);

  useEffect(() => {
    setHasRevealed(false);
  }, [replayKey]);

  return (
    <div ref={cardRef} className="project-card-reveal">
      <motion.article
        className={`project-card ${isActive ? 'is-active' : ''} ${reduceMotion ? 'reduced-motion' : ''}`}
        initial={reduceMotion ? false : { clipPath: genieCollapsed }}
        animate={reduceMotion || hasRevealed ? {
          clipPath: reduceMotion ? fullCard : genieOpening,
          zIndex: isActive ? 12 : 1,
        } : {
          clipPath: genieCollapsed,
          zIndex: isActive ? 12 : 1,
        }}
        transition={reduceMotion ? { duration: 0 } : {
          clipPath: { duration: 1.35, delay: revealDelay, ease: [0.22, 0.9, 0.46, 1] },
       
        }}
        onPointerMove={(event) => {
          if (reduceMotion || (event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          const localX = event.clientX - bounds.left;
          const localY = event.clientY - bounds.top;
          const x = localX / bounds.width;
          const y = localY / bounds.height;
          event.currentTarget.style.setProperty('--card-pointer-x', `${x * 100}%`);
          event.currentTarget.style.setProperty('--card-pointer-y', `${y * 100}%`);
        }}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse' || event.pointerType === 'pen') onHover(index);
        }}
        onPointerLeave={(event) => {
          event.currentTarget.style.setProperty('--card-pointer-x', '50%');
          event.currentTarget.style.setProperty('--card-pointer-y', '50%');
          onHover(null);
        }}
      >
        <div className="project-topline">
          <span className="project-type">{project.type}</span>
          <Code2 size={18} />
        </div>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <div className="chip-row">
          {project.tech.map((tech) => (
            <span key={`${project.id}-${tech}`}>{tech}</span>
          ))}
        </div>
        <a href={project.link} target="_blank" rel="noreferrer">
          <ScrambleText text="Explore project" /> <ArrowRight size={16} />
        </a>
      </motion.article>
    </div>
  );
}

export function ProjectsSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [replayKey, setReplayKey] = useState(0);
  const hasLeftPageTop = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        hasLeftPageTop.current = true;
      } else if (window.scrollY <= 2 && hasLeftPageTop.current) {
        hasLeftPageTop.current = false;
        setReplayKey((key) => key + 1);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="projects" className="content-section">
      <div className="section-heading">
        <p className="section-kicker"><HeightRevealText text="Projects" /></p>
        <h2><RevealWords text="Selected work" /></h2>
      </div>

      <div className="project-grid">
        {featuredProjects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} hoveredIndex={hoveredIndex} onHover={setHoveredIndex} replayKey={replayKey} />
        ))}
      </div>

      <div className="section-heading more-work-heading">
        <p className="section-kicker"><ScrambleText text="More" /></p>
        <h2><RevealWords text="Additional work" /></h2>
      </div>

      <div className="project-grid">
        {moreProjects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={featuredProjects.length + index} hoveredIndex={hoveredIndex} onHover={setHoveredIndex} replayKey={replayKey} />
        ))}
      </div>
    </section>
  );
}

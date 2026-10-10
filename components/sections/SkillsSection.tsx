'use client';

import {
  Braces,
  Code2,
  Database,
  FlaskConical,
  PanelsTopLeft,
  Radio,
  Server,
  Wrench,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { RevealWords } from '@/components/motion/RevealWords';
import { ScrambleText } from '@/components/motion/ScrambleText';
import { skills } from '@/data/site';

const categoryIcons = [
  Code2,
  PanelsTopLeft,
  Server,
  Radio,
  Database,
  Wrench,
  FlaskConical,
];

function SkillCardFace({ category, items, Icon }: {
  category: string;
  items: string[];
  Icon: LucideIcon;
}) {
  return (
    <div className="skill-group">
      <div className="skill-group-heading">
        <span className="skill-category-icon"><Icon size={18} strokeWidth={1.8} /></span>
        <h3>{category}</h3>
      </div>
      <div className="chip-row skill-chip-row">
        {items.map((item) => (
          <span className="skill-chip" key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}

export function SkillsSection() {
  const skillsGridRef = useRef<HTMLDivElement>(null);
  const isArmedRef = useRef(true);
  const hasLeftTopRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const grid = skillsGridRef.current;
    if (!grid) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && isArmedRef.current) {
          isArmedRef.current = false;
          setIsOpen(true);
        }
      },
      { threshold: 0.01 },
    );
    const handleScroll = () => {
      if (window.scrollY > 80) {
        hasLeftTopRef.current = true;
      } else if (window.scrollY <= 2 && hasLeftTopRef.current) {
        hasLeftTopRef.current = false;
        isArmedRef.current = true;
        setIsOpen(false);
      }
    };

    observer.observe(grid);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section id="skills" className="content-section">
      <div className="section-heading">
        <p className="section-kicker"><ScrambleText text="Skills" /></p>
        <h2><RevealWords text="Technology stack" /></h2>
      </div>

      <div
        ref={skillsGridRef}
        className="skills-grid"
      >
        {Object.entries(skills).map(([category, items], index) => {
          const Icon = categoryIcons[index] ?? Braces;

          return (
            <motion.div
              className="skill-card-stage"
              key={category}
              whileHover={{ y: -3 }}
            >
              <motion.div
                className="skill-card-enter"
                initial={reduceMotion ? false : { y: 20, scale: 0.95, rotateX: 7, rotateY: -3, opacity: 0.65 }}
                animate={reduceMotion || isOpen
                  ? { y: 0, scale: 1, rotateX: 0, rotateY: 0, opacity: 1 }
                  : { y: 20, scale: 0.95, rotateX: 7, rotateY: -3, opacity: 0.65 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.5,
                  delay: reduceMotion || !isOpen ? 0 : index * 0.48,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <SkillCardFace category={category} items={items} Icon={Icon} />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

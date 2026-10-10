'use client';

import { motion } from 'framer-motion';
import { Briefcase, FolderKanban, GraduationCap } from 'lucide-react';
import { RevealWords } from '@/components/motion/RevealWords';
import { ScrambleText } from '@/components/motion/ScrambleText';
import { education } from '@/data/site';

export function AboutSection() {
  return (
    <section id="about" className="content-section split-section">
      <div className="section-heading">
        <p className="section-kicker"><ScrambleText text="About" /></p>
        <h2><RevealWords text="Engineer with product thinking and a frontend-first mindset." /></h2>
      </div>

      <motion.div
        className="about-card"
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <div className="about-copy">
          <p>
            I am Monish, a software engineer with a strong foundation in full-stack application development and a passion for building efficient, maintainable, and user-friendly systems.
          </p>
          <p>
            My experience spans enterprise monitoring platforms, business applications, and cross-platform mobile development. I enjoy turning requirements into polished interfaces and reliable APIs while focusing on performance, UI consistency, and clean architecture.
          </p>
        </div>

        <div className="quick-facts">
          <div>
            <GraduationCap size={18} />
            <span>{education.degree}</span>
          </div>
          <div>
            <Briefcase size={18} />
            <span>GE Vernova • Belcan</span>
          </div>
          <div>
            <FolderKanban size={18} />
            <span>Projects in web, mobile, and SaaS</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

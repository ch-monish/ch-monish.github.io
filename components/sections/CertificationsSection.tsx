'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { HeightRevealText, RevealWords } from '@/components/motion/RevealWords';
import { ScrambleText } from '@/components/motion/ScrambleText';
import { certification } from '@/data/site';

export function CertificationsSection() {
  return (
    <section id="certifications" className="content-section">
      <div className="section-heading">
        <p className="section-kicker"><HeightRevealText text="Certifications" /></p>
        <h2><RevealWords text="Recognitions" /></h2>
      </div>

      <motion.div
        className="cert-card"
        initial={{ opacity: 0, y: 16, scale: 0.985 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <div>
          <Sparkles size={18} />
        </div>
        <div>
          <h3>{certification.title}</h3>
          <p>{certification.date}</p>
        </div>
        <a href={certification.href} target="_blank" rel="noreferrer">
          <ScrambleText text="View credential" />
        </a>
      </motion.div>
    </section>
  );
}

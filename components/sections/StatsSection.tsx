'use client';

import { motion } from 'framer-motion';
import { stats } from '@/data/site';

export function StatsSection() {
  return (
    <section className="stats-grid" aria-label="Career metrics">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="stat-card"
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.55, delay: index * 0.08, ease: 'easeOut' }}
        >
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </motion.div>
      ))}
    </section>
  );
}

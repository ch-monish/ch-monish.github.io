'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Download,
  Menu,
  MoonStar,
  SunMedium,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BackToTopRocket } from '@/components/effects/BackToTopRocket';
import { FluidCursor } from '@/components/effects/FluidCursor';
import { HeroPanel } from '@/components/hero/HeroPanel';
import { RevealWords } from '@/components/motion/RevealWords';
import { ScrambleText } from '@/components/motion/ScrambleText';
import { AboutSection } from '@/components/sections/AboutSection';
import { CertificationsSection } from '@/components/sections/CertificationsSection';
import { ContactFooter } from '@/components/sections/ContactFooter';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { StatsSection } from '@/components/sections/StatsSection';
import { contact, sitePalettes, type SitePaletteId } from '@/data/site';

export default function HomePage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [paletteId, setPaletteId] = useState<SitePaletteId>('cobalt');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('portfolio-theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
      return;
    }

    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    setTheme(prefersLight ? 'light' : 'dark');
  }, []);

  useEffect(() => {
    const savedPalette = window.localStorage.getItem('portfolio-palette');
    if (savedPalette && savedPalette in sitePalettes) {
      setPaletteId(savedPalette as SitePaletteId);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  useEffect(() => {
    const palette = sitePalettes[paletteId];
    const root = document.documentElement;
    root.style.setProperty('--accent', palette.accent);
    root.style.setProperty('--accent-strong', palette.strong);
    root.style.setProperty('--accent-2', palette.accent2);
    root.style.setProperty('--accent-rgb', palette.rgb);
    root.style.setProperty('--accent-2-rgb', palette.accent2Rgb);
    root.style.setProperty('--accent-shadow', palette.shadow);
    window.localStorage.setItem('portfolio-palette', paletteId);
  }, [paletteId]);

  const themeLabel = useMemo(() => (theme === 'dark' ? 'Light mode' : 'Dark mode'), [theme]);

  return (
    <>
      <main id="top" className={`theme-shell ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <div className="space-backdrop" aria-hidden="true">
        <span className="cosmic-cloud cosmic-cloud-violet" />
        <span className="cosmic-cloud cosmic-cloud-cyan" />
        <span className="cosmic-cloud cosmic-cloud-rose" />
        <span className="space-planet space-planet-one" />
        <span className="space-planet space-planet-two" />
        <span className="space-planet space-planet-three" />
        <span className="cosmic-black-hole"><span className="cosmic-black-hole-core" /></span>
        <span className="cosmic-quasar" />
        <span className="cosmic-galaxy cosmic-galaxy-hoag" />
        <span className="cosmic-galaxy cosmic-galaxy-dwarf" />
        <span className="cosmic-boomerang" />
        <span className="cosmic-dyson"><span className="cosmic-dyson-grid" /></span>
        <span className="space-pulsar" />
        <span className="space-pulsar space-pulsar-two" />
        <span className="space-pulsar space-pulsar-three" />
        <span className="cosmic-frb" />
      </div>
      <FluidCursor />
      <BackToTopRocket />
      <HeroPanel onPaletteSelect={setPaletteId} />
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <motion.header
        className="topbar"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <a className="brand-block" href="#top" aria-label="Sai Monish Cheruku, home">
          <span className="brand-mark" aria-hidden="true">SM</span>
          <span className="brand-copy">
            <strong>Sai Monish</strong>
            <small>Full-Stack Engineer</small>
          </span>
        </a>

        <nav
          id="primary-navigation"
          className={`nav-links ${mobileMenuOpen ? 'is-open' : ''}`}
          aria-label="Primary navigation"
        >
          <a href="#about" onClick={() => setMobileMenuOpen(false)}><ScrambleText text="About" /><ArrowUpRight className="nav-link-icon" size={14} aria-hidden="true" /></a>
          <a href="#experience" onClick={() => setMobileMenuOpen(false)}><ScrambleText text="Experience" /><ArrowUpRight className="nav-link-icon" size={14} aria-hidden="true" /></a>
          <a href="#projects" onClick={() => setMobileMenuOpen(false)}><ScrambleText text="Projects" /><ArrowUpRight className="nav-link-icon" size={14} aria-hidden="true" /></a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)}><ScrambleText text="Contact" /><ArrowUpRight className="nav-link-icon" size={14} aria-hidden="true" /></a>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            aria-label={themeLabel}
            aria-pressed={theme === 'light'}
            title={themeLabel}
          >
            {theme === 'dark' ? <SunMedium size={18} /> : <MoonStar size={18} />}
          </button>
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileMenuOpen}
            aria-controls="primary-navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.header>

      <section className="hero-section">
        <div className="hero-copy">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow"
          >
            <ScrambleText text="Full-Stack Software Engineer" />
          </motion.p>

          <h1>
            <RevealWords text="Building scalable digital experiences from ideas to deployment." onLoad />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="intro"
          >
            I&apos;m Sai Monish, a full-stack engineer with 4+ years of experience designing and delivering modern web applications with React, TypeScript, Python, Django, and enterprise-grade user interfaces.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="cta-row"
          >
            <a href="#projects" className="primary-btn">
              <ScrambleText text="View Projects" /> <ArrowRight size={18} />
            </a>
            <a href={contact.resume} className="secondary-btn" target="_blank" rel="noreferrer">
              <Download size={18} /> <ScrambleText text="Download Resume" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mini-meta"
          >
            <span>React.js</span>
            <span>JavaScript</span>
            <span>TypeScript</span>
            <span>Python</span>
            <span>Django</span>
          </motion.div>
        </div>
      </section>

      <StatsSection />
      <AboutSection />
      <ExperienceSection />
      <ProjectsSection />
      <SkillsSection />
      <CertificationsSection />
      <ContactFooter />
    </main>
    </>
  );
}

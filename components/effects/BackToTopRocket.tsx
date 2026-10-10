'use client';

import { useEffect, useRef, useState } from 'react';

type ExhaustTrail = {
  paths: string[];
  width: number;
  height: number;
};

export function BackToTopRocket() {
  const [visible, setVisible] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [trail, setTrail] = useState<ExhaustTrail | null>(null);
  const launchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollFrame = useRef<number | null>(null);

  useEffect(() => {
    const updateVisibility = () => {
      setVisible(window.scrollY > Math.max(480, window.innerHeight * 0.55));
    };

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateVisibility);
      if (launchTimeout.current) clearTimeout(launchTimeout.current);
      if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current);
    };
  }, []);

  const launch = () => {
    if (launching) return;

    const { innerHeight: height, innerWidth: width } = window;
    const x = width - 52;
    setTrail({
      width,
      height,
      paths: [
        `M ${x} ${height - 43} C ${x - 12} ${height * 0.74}, ${x + 12} ${height * 0.48}, ${x - 3} ${height * 0.22} S ${x - 5} ${height * 0.04}, ${x} -90`,
        `M ${x} ${height - 43} C ${x - 19} ${height * 0.74}, ${x - 27} ${height * 0.48}, ${x - 12} ${height * 0.22} S ${x - 4} ${height * 0.04}, ${x} -90`,
        `M ${x} ${height - 43} C ${x + 17} ${height * 0.74}, ${x + 25} ${height * 0.48}, ${x + 11} ${height * 0.22} S ${x + 4} ${height * 0.04}, ${x} -90`,
      ],
    });
    setLaunching(true);
    setVisible(false);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo(0, 0);
    } else {
      const startY = window.scrollY;
      const startedAt = performance.now();
      const scrollDuration = 950;
      const scrollToTop = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / scrollDuration);
        const easedProgress = 1 - (1 - progress) ** 3;
        window.scrollTo(0, Math.round(startY * (1 - easedProgress)));
        if (progress < 1) {
          scrollFrame.current = window.requestAnimationFrame(scrollToTop);
        } else {
          scrollFrame.current = null;
        }
      };
      scrollFrame.current = window.requestAnimationFrame(scrollToTop);
    }

    launchTimeout.current = setTimeout(() => {
      setLaunching(false);
      setTrail(null);
      launchTimeout.current = null;
    }, 4000);
  };

  return (
    <>
      {trail && (
        <svg
          className="rocket-exhaust-trail"
          viewBox={`0 0 ${trail.width} ${trail.height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="rocket-smoke-gradient"
              gradientUnits="userSpaceOnUse"
              x1={trail.width - 52}
              y1={trail.height - 43}
              x2={trail.width - 52}
              y2="-90"
            >
              <stop offset="0%" stopColor="#f4fbff" stopOpacity="0.62" />
              <stop offset="18%" stopColor="#e4edf2" stopOpacity="0.44" />
              <stop offset="42%" stopColor="#cbd8e2" stopOpacity="0.22" />
              <stop offset="70%" stopColor="#aab9c8" stopOpacity="0.09" />
              <stop offset="100%" stopColor="#8a9aaa" stopOpacity="0.015" />
            </linearGradient>
            <filter id="rocket-smoke-soften" x="-100%" y="-30%" width="300%" height="160%">
              <feTurbulence type="fractalNoise" baseFrequency="0.04 0.08" numOctaves="2" seed="8" result="smokeNoise" />
              <feDisplacementMap in="SourceGraphic" in2="smokeNoise" scale="18" xChannelSelector="R" yChannelSelector="G" />
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>
          {trail.paths.map((path, index) => (
            <path
              key={path}
              className={['rocket-smoke-cloud', 'rocket-smoke-body', 'rocket-smoke-wisp'][index]}
              d={path}
              pathLength="1"
              filter={index === 0 ? 'url(#rocket-smoke-soften)' : undefined}
              style={{ animationDelay: `${index * 70}ms` }}
            />
          ))}
        </svg>
      )}
      {(visible || launching) && (
        <button
          className={`back-to-top-rocket${launching ? ' is-launching' : ''}`}
          type="button"
          onClick={launch}
          aria-label={launching ? 'Rocket launching to the top' : 'Launch rocket to return to the top'}
          title={launching ? 'Launching to the top' : 'Launch to top'}
          disabled={launching}
        >
          <span className="rocket-engine-flame" aria-hidden="true" />
          <svg className="rocket-craft" viewBox="0 0 48 48" aria-hidden="true">
            <defs>
              <linearGradient id="rocket-shell-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffdc70" />
                <stop offset="48%" stopColor="#ff7b68" />
                <stop offset="100%" stopColor="#a65bff" />
              </linearGradient>
            </defs>
            <path d="M24 3C17 9 13.5 17 14.5 27l3.8 6h11.4l3.8-6C34.5 17 31 9 24 3Z" fill="url(#rocket-shell-gradient)" stroke="#fff2cf" strokeWidth="1.2" />
            <path d="M15 23 6.5 32.5 18 30m15-7 8.5 9.5L30 30" fill="#54dafa" stroke="#d9fbff" strokeWidth="1.2" strokeLinejoin="round" />
            <rect x="19" y="28" width="10" height="7" rx="2" fill="#eefaff" />
            <circle cx="24" cy="17" r="4.2" fill="#17315b" stroke="#b8f4ff" strokeWidth="1.5" />
            <circle cx="22.8" cy="15.7" r="1.1" fill="#fff" opacity=".9" />
            <path d="M19 34v3h10v-3" fill="#7186a8" stroke="#d7eaff" strokeWidth="1" />
          </svg>
          <span className="rocket-button-halo" aria-hidden="true" />
        </button>
      )}
    </>
  );
}

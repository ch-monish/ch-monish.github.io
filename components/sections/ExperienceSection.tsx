'use client';

import { GraduationCap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { education, experience } from '@/data/site';

function TimelineItem({ children, className = '', replayKey }: {
  children: React.ReactNode;
  className?: string;
  replayKey: number;
}) {
  const itemRef = useRef<HTMLElement>(null);
  const [hasRevealed, setHasRevealed] = useState(false);

  useEffect(() => {
    setHasRevealed(false);
    const item = itemRef.current;
    if (!item) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasRevealed(true);
          observer.unobserve(item);
        }
      },
      { rootMargin: '-12% 0px -12% 0px', threshold: 0.01 },
    );
    observer.observe(item);

    return () => observer.disconnect();
  }, [replayKey]);

  return (
    <article
      ref={itemRef}
      className={`timeline-item ${className} ${hasRevealed ? 'is-revealed' : ''}`}
    >
      {children}
    </article>
  );
}

function TimelineText({ text, lineIndex = 0 }: { text: string; lineIndex?: number }) {
  return (
    <span className="timeline-letter-text">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {Array.from(text).map((letter, index) => letter === ' '
          ? ' '
          : (
            <span className="timeline-letter-mask" key={index}>
              <span style={{ animationDelay: `${Math.min(lineIndex * 130 + index * 14, 2200)}ms` }}>
                {letter}
              </span>
            </span>
          ))}
      </span>
    </span>
  );
}

export function ExperienceSection() {
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
    <section id="experience" className="content-section">
      <div className="section-heading">
        <p className="section-kicker">Experience</p>
        <h2>Career timeline</h2>
      </div>

      <div className="timeline">
        {experience.map((item) => (
          <TimelineItem key={`${item.company}-${item.role}`} replayKey={replayKey}>
            <div className="timeline-dot" />
            <div className="timeline-content">
              <div className="timeline-header">
              <div>
                <h3><TimelineText text={item.role} lineIndex={0} /></h3>
                <p><TimelineText text={item.company} lineIndex={1} /></p>
              </div>
              <span><TimelineText text={item.period} lineIndex={2} /></span>
              </div>
              <ul>
              {item.responsibilities.map((point, index) => (
                <li key={point}><TimelineText text={point} lineIndex={index + 3} /></li>
              ))}
              </ul>
            </div>
          </TimelineItem>
        ))}

        <TimelineItem className="education-item" replayKey={replayKey}>
          <div className="timeline-dot" />
          <div className="timeline-content">
            <div className="timeline-header">
              <div>
              <h3><TimelineText text={education.degree} lineIndex={0} /></h3>
              <p><TimelineText text={education.school} lineIndex={1} /></p>
              </div>
              <span><TimelineText text={education.period} lineIndex={2} /></span>
            </div>
            <p className="education-note">
              <GraduationCap size={16} /> <TimelineText text="Education" lineIndex={3} />
            </p>
          </div>
        </TimelineItem>
      </div>
    </section>
  );
}

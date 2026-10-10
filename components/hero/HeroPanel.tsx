'use client';

import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState, type RefObject } from 'react';
import type { HeroInteraction, SitePaletteId } from '@/data/site';

const HeroScene = dynamic(
  () => import('@/components/hero/HeroScene').then((mod) => mod.HeroScene),
  {
    ssr: false,
    loading: () => <div className="scene-fallback" aria-hidden="true" />,
  },
);

function HeroContentLens({ panelRef, interaction }: {
  panelRef: RefObject<HTMLDivElement>;
  interaction: HeroInteraction;
}) {
  const [heroSection, setHeroSection] = useState<HTMLElement | null>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const section = document.querySelector<HTMLElement>('.hero-section');
    if (!section) return;

    setHeroSection(section);
  }, []);

  useEffect(() => {
    const section = heroSection;
    const panel = panelRef.current;
    const lens = lensRef.current;
    const content = contentRef.current;
    const source = section?.querySelector<HTMLElement>('.hero-copy');
    if (!section || !panel || !lens || !content || !source) return;

    const clone = source.cloneNode(true) as HTMLElement;
    clone.setAttribute('aria-hidden', 'true');
    clone.style.position = 'absolute';
    clone.style.margin = '0';
    clone.style.maxWidth = 'none';
    clone.style.width = `${source.getBoundingClientRect().width}px`;
    clone.style.transform = 'scale(1.35)';
    clone.style.transformOrigin = '0 0';
    clone.querySelectorAll<HTMLElement>('[id]').forEach((element) => element.removeAttribute('id'));
    clone.querySelectorAll<HTMLElement>('a, button, input, select, textarea, [tabindex]').forEach((element) => {
      element.setAttribute('tabindex', '-1');
    });
    content.replaceChildren(clone);

    const sourceElements = Array.from(source.querySelectorAll<HTMLElement>('*'));
    const cloneElements = Array.from(clone.querySelectorAll<HTMLElement>('*'));
    const sourceIndexes = new Map(sourceElements.map((element, index) => [element, index]));
    const animationObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        const index = sourceIndexes.get(record.target as HTMLElement);
        if (index !== undefined && cloneElements[index]) {
          cloneElements[index].style.cssText = sourceElements[index].style.cssText;
        }
      });
    });
    animationObserver.observe(source, { attributes: true, attributeFilter: ['style'], subtree: true });

    const updateLens = (event?: PointerEvent) => {
      const sectionBounds = section.getBoundingClientRect();
      const panelBounds = panel.getBoundingClientRect();
      const sourceBounds = source.getBoundingClientRect();
      const radius = Math.min(panelBounds.width, panelBounds.height) * 0.07;
      const inside = event
        ? event.clientX >= panelBounds.left && event.clientX <= panelBounds.right
          && event.clientY >= panelBounds.top && event.clientY <= panelBounds.bottom
        : interaction.active;
      const clientX = event ? event.clientX : panelBounds.left + ((interaction.x + 1) / 2) * panelBounds.width;
      const clientY = event ? event.clientY : panelBounds.top + ((1 - interaction.y) / 2) * panelBounds.height;
      const x = clientX - sectionBounds.left;
      const y = clientY - sectionBounds.top;

      lens.style.width = `${radius * 2}px`;
      lens.style.height = `${radius * 2}px`;
      lens.style.left = `${x - radius}px`;
      lens.style.top = `${y - radius}px`;
      lens.style.opacity = inside && !reduceMotion ? '1' : '0';

      const hideOriginal = inside && !reduceMotion;
      source.classList.toggle('hero-copy--lens-active', hideOriginal);
      source.style.setProperty('--hero-lens-x', `${clientX - sourceBounds.left}px`);
      source.style.setProperty('--hero-lens-y', `${clientY - sourceBounds.top}px`);
      source.style.setProperty('--hero-lens-radius', `${radius}px`);

      const cloneLeft = sourceBounds.left - sectionBounds.left;
      const cloneTop = sourceBounds.top - sectionBounds.top;
      clone.style.left = `${cloneLeft}px`;
      clone.style.top = `${cloneTop}px`;
      clone.style.transformOrigin = `${x - cloneLeft}px ${y - cloneTop}px`;
      content.style.width = `${sectionBounds.width}px`;
      content.style.height = `${sectionBounds.height}px`;
      content.style.left = `${-x + radius}px`;
      content.style.top = `${-y + radius}px`;
    };

    const onPointerMove = (event: PointerEvent) => updateLens(event);
    const onWindowBlur = () => {
      lens.style.opacity = '0';
      source.classList.remove('hero-copy--lens-active');
    };
    const onResize = () => updateLens();
    const resizeObserver = new ResizeObserver(() => updateLens());

    updateLens();
    resizeObserver.observe(section);
    resizeObserver.observe(source);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('resize', onResize);
    return () => {
      source.classList.remove('hero-copy--lens-active');
      source.style.removeProperty('--hero-lens-x');
      source.style.removeProperty('--hero-lens-y');
      source.style.removeProperty('--hero-lens-radius');
      animationObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('resize', onResize);
    };
  }, [heroSection, interaction, panelRef, reduceMotion]);

  if (!heroSection) return null;

  return createPortal(
    <div className="hero-content-lens" aria-hidden="true">
      <div className="hero-content-lens__window" ref={lensRef}>
        <div className="hero-content-lens__content" ref={contentRef} />
      </div>
    </div>,
    heroSection,
  );
}

export function HeroPanel({ onPaletteSelect }: { onPaletteSelect: (paletteId: SitePaletteId) => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const sceneInteractionRef = useRef<HeroInteraction>({ active: false, lastMove: 0, x: 0, y: 0 });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio > 0.12),
      { threshold: [0, 0.12, 0.4] },
    );

    const onPointerMove = (event: PointerEvent) => {
      const bounds = panel.getBoundingClientRect();
      const inside = event.clientX >= bounds.left && event.clientX <= bounds.right
        && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      const interaction = sceneInteractionRef.current;
      interaction.active = inside;
      if (!inside) return;

      interaction.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      interaction.y = 1 - ((event.clientY - bounds.top) / bounds.height) * 2;
      interaction.lastMove = performance.now() / 1000;
    };

    const onWindowBlur = () => { sceneInteractionRef.current.active = false; };

    observer.observe(panel);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('blur', onWindowBlur);
    return () => {
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('blur', onWindowBlur);
    };
  }, []);

  return (
    <div className="scene-panel" ref={panelRef}>
      <div className="scene-glow" />
      <div className="scene-canvas">
        <HeroScene
          interaction={sceneInteractionRef.current}
          onPaletteSelect={onPaletteSelect}
          frameloop={visible ? 'always' : 'never'}
        />
      </div>
      <HeroContentLens panelRef={panelRef} interaction={sceneInteractionRef.current} />
      <p className="scene-hint scene-hint-fine">Drag to orbit · scroll to zoom · click a form to recolor</p>
      <p className="scene-hint scene-hint-coarse">Tap a form to recolor the site</p>
    </div>
  );
}

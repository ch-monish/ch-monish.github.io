'use client';

import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import { Github, Linkedin, Mail, Phone } from 'lucide-react';
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type MutableRefObject, type ReactNode } from 'react';
import { RevealWords } from '@/components/motion/RevealWords';
import { ScrambleText } from '@/components/motion/ScrambleText';
import { contact } from '@/data/site';
import type { SharkInteraction } from '@/components/sections/FooterShark';

const FooterSharkScene = dynamic(
  () => import('@/components/sections/FooterShark').then((module) => module.FooterShark),
  { ssr: false, loading: () => null },
);

type WaterInput = (x: number, y: number, speed: number, direction: number, impact: boolean) => void;

function FooterSplash({ inputRef }: { inputRef: MutableRefObject<WaterInput | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.closest('.footer-shell');
    const context = canvas?.getContext('2d');
    if (!canvas || !parent || !context) return;

    const waves: Array<{ x: number; startedAt: number; strength: number }> = [];
    const ripples: Array<{ x: number; y: number; startedAt: number; strength: number; angle: number }> = [];
    const impacts: Array<{ x: number; y: number; startedAt: number; strength: number; angle: number }> = [];
    const drops: Array<{ x: number; y: number; vx: number; vy: number; size: number; age: number; life: number }> = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = false;
    let previousTime = 0;
    let lastInput: { x: number; y: number; at: number } | null = null;

    const surfaceAt = (x: number, time: number) => {
      const elapsed = time / 1000;
      let displacement = Math.sin(x * 0.008 + elapsed * 0.7) * 20.4
      // let displacement = Math.sin(x * 0.008 + elapsed * 0.7) * (Math.random()*0.000009)
      // let displacement = Math.sin(x * 0.008 + elapsed * 0.7) * Math.floor(Math.random() * (90 - 30 + 1)) + 3;
      // let displacement = Math.sin(x * 0.008 + elapsed * 0.7) * 24;
        + Math.sin(x * 0.014 - elapsed * 0.48) * 1.8
        + Math.sin(x * 0.004 + elapsed * 0.28) * 2.2;

      let waveDisplacement = 40;
      for (const wave of waves) {
        const age = Math.max(0, (time - wave.startedAt) / 1000);
        const distance = Math.abs(x - wave.x);
        const crestDistance = distance - age * 190;
        const envelope = Math.exp(-((crestDistance / 92) ** 2));
        waveDisplacement += Math.sin(crestDistance * 0.085)
          * envelope
          * wave.strength * 4.5
          * Math.exp(-age * 1.4);
      }

      displacement += Math.max(-10, Math.min(10, waveDisplacement));
      return Math.max(8, Math.min(height - 8, height * 0.44 + displacement));
    };

    const addSplash = (x: number, y: number, strength: number, angle: number, impact: boolean, time: number) => {
      const surface = surfaceAt(x, time);
      waves.push({ x, startedAt: time, strength });
      if (waves.length > 20) waves.splice(0, waves.length - 20);

      ripples.push({ x, y, startedAt: time, strength, angle });
      if (ripples.length > 24) ripples.splice(0, ripples.length - 24);
      impacts.push({ x, y, startedAt: time, strength, angle });
      if (impacts.length > 16) impacts.splice(0, impacts.length - 16);

      if (impact || strength > 1.25) {
        const count = Math.min(10, Math.round(3 + strength * 3));
        for (let index = 0; index < count; index += 1) {
          const spread = (Math.random() - 0.5) * 2;
          drops.push({
            x: x + spread * 24,
            y: y - 5 + Math.random() * 4,
            vx: Math.cos(angle) * 35 + spread * 65,
            vy: -(90 + Math.random() * 135) * Math.min(1.5, strength),
            size: 1.2 + Math.random() * 1.8,
            age: 0,
            life: 0.42 + Math.random() * 0.5,
          });
        }
      }

      if (drops.length > 80) drops.splice(0, drops.length - 80);
    };

    inputRef.current = (x, y, speed, direction, impact) => {
      if (reduceMotion) return;
      const time = performance.now();
      if (y < surfaceAt(x, time)) return;
      if (!impact && lastInput) {
        const distance = Math.hypot(x - lastInput.x, y - lastInput.y);
        if (distance < 16 || time - lastInput.at < 70) return;
      }

      const strength = impact ? 1.9 : Math.min(1.9, 0.45 + speed * 0.62);
      const angle = lastInput ? Math.atan2(y - lastInput.y, x - lastInput.x) : (direction >= 0 ? 0 : Math.PI);
      addSplash(x, y, strength, angle, impact, time);
      lastInput = { x, y, at: time };
      schedule();
    };

    const drawWater = (time: number) => {
      const delta = Math.min((time - previousTime) / 1000 || 0.016, 0.04);
      previousTime = time;
      context.clearRect(0, 0, width, height);

      context.beginPath();
      for (let x = 0; x <= width; x += 6) {
        const y = surfaceAt(x, time);
        if (x === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.lineTo(width, height);
      context.lineTo(0, height);
      context.closePath();
      const water = context.createLinearGradient(0, height * 0.42, 0, height);
      water.addColorStop(0, 'rgba(59, 171, 190, 0.22)');
      water.addColorStop(0.24, 'rgba(35, 139, 164, 0.13)');
      water.addColorStop(1, 'rgba(25, 84, 130, 0.08)');
      context.fillStyle = water;
      context.fill();

      context.save();
      context.beginPath();
      for (let x = 0; x <= width; x += 6) {
        const y = surfaceAt(x, time);
        if (x === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.lineTo(width, height);
      context.lineTo(0, height);
      context.closePath();
      context.clip();
      for (let band = 0; band < 6; band += 1) {
        context.beginPath();
        for (let x = 0; x <= width; x += 12) {
          const y = surfaceAt(x, time) + 15 + band * 19
            + Math.sin(x * 0.012 + time * 0.0007 + band * 1.3) * 2.5;
          if (x === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.strokeStyle = `rgba(174, 238, 241, ${0.025 + Math.sin(time * 0.001 + band) * 0.01})`;
        context.lineWidth = 1 + (band % 2) * 0.5;
        context.stroke();
      }
      for (const ripple of ripples) {
        const age = (time - ripple.startedAt) / 1000;
        const radius = age * 105;
        const fade = Math.exp(-age * 1.15) * Math.min(1, age * 5) * ripple.strength;
        if (fade < 0.025) continue;
        for (let ring = 0; ring < 2; ring += 1) {
          const ringRadius = radius - ring * 18;
          if (ringRadius <= 0) continue;
          context.beginPath();
          context.ellipse(
            ripple.x,
            ripple.y,
            ringRadius,
            Math.max(2, ringRadius * 0.23),
            ripple.angle * 0.08,
            0,
            Math.PI * 2,
          );
          context.strokeStyle = `rgba(201, 246, 248, ${Math.min(0.14, fade * (0.13 - ring * 0.035))})`;
          context.lineWidth = ring === 0 ? 1.3 : 0.85;
          context.stroke();
        }
      }
      context.restore();

      context.beginPath();
      for (let x = 0; x <= width; x += 6) {
        const y = surfaceAt(x, time);
        if (x === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.strokeStyle = 'rgba(166, 231, 237, 0.38)';
      context.lineWidth = 1.2;
      context.stroke();

      for (const impact of impacts) {
        const age = Math.max(0, (time - impact.startedAt) / 1000);
        const fade = Math.exp(-age * 4.2) * impact.strength;
        if (fade < 0.025) continue;

        const cavityRadius = (32 + impact.strength * 7) * (1 - Math.exp(-age * 32));
        if (cavityRadius > 0.5) {
          context.save();
          context.globalCompositeOperation = 'destination-out';
          context.beginPath();
          context.ellipse(impact.x, impact.y, cavityRadius, cavityRadius * 0.62, impact.angle * 0.12, 0, Math.PI * 2);
          context.fill();
          context.restore();
        }

        context.beginPath();
        context.ellipse(impact.x, impact.y, cavityRadius * (1.15 + age * 2.5), Math.max(2, cavityRadius * 0.72), impact.angle * 0.12, Math.PI, Math.PI * 2);
        context.strokeStyle = `rgba(210, 250, 251, ${Math.min(0.38, fade * 0.24)})`;
        context.lineWidth = 1.5;
        context.stroke();

        const swellRadius = cavityRadius + age * 70;
        context.beginPath();
        context.ellipse(impact.x, impact.y, swellRadius, Math.max(2, swellRadius * 0.42), impact.angle * 0.08, 0, Math.PI * 2);
        context.strokeStyle = `rgba(151, 225, 233, ${Math.min(0.22, fade * 0.12)})`;
        context.lineWidth = 1;
        context.stroke();
      }

      for (let index = drops.length - 1; index >= 0; index -= 1) {
        const drop = drops[index];
        drop.age += delta;
        drop.vy += 480 * delta;
        drop.vx *= Math.exp(-0.22 * delta);
        drop.x += drop.vx * delta;
        drop.y += drop.vy * delta;
        const currentSurface = surfaceAt(drop.x, time);
        if (drop.age > drop.life || (drop.vy > 0 && drop.y > currentSurface) || drop.y < -8 || drop.x < -20 || drop.x > width + 20) {
          drops.splice(index, 1);
          continue;
        }

        const alpha = Math.min(0.86, (1 - drop.age / drop.life) * 0.78);
        context.beginPath();
        context.ellipse(drop.x, drop.y, drop.size * 0.62, drop.size * 1.15, Math.atan2(drop.vy, drop.vx) - Math.PI / 2, 0, Math.PI * 2);
        context.fillStyle = `rgba(208, 248, 249, ${alpha})`;
        context.shadowColor = `rgba(120, 220, 230, ${alpha * 0.45})`;
        context.shadowBlur = 4;
        context.fill();
        context.shadowBlur = 0;
        context.beginPath();
        context.ellipse(drop.x - drop.size * 0.16, drop.y - drop.size * 0.25, drop.size * 0.18, drop.size * 0.35, 0, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 255, 255, ${alpha * 0.55})`;
        context.fill();
      }

      for (let index = waves.length - 1; index >= 0; index -= 1) {
        if (time - waves[index].startedAt > 2800) waves.splice(index, 1);
      }
      for (let index = ripples.length - 1; index >= 0; index -= 1) {
        if (time - ripples[index].startedAt > 1600) ripples.splice(index, 1);
      }
      for (let index = impacts.length - 1; index >= 0; index -= 1) {
        if (time - impacts[index].startedAt > 650) impacts.splice(index, 1);
      }
    };

    const animate = (time: number) => {
      frame = 0;
      drawWater(time);
      if (visible && !reduceMotion) frame = window.requestAnimationFrame(animate);
    };

    const schedule = () => {
      if (!frame && visible && !reduceMotion) frame = window.requestAnimationFrame(animate);
      else if (!frame && reduceMotion) drawWater(performance.now());
    };

    const resize = () => {
      const bounds = parent.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(bounds.width));
      height = Math.max(1, Math.round(bounds.height));
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      drawWater(performance.now());
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
      else if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    }, { rootMargin: '100px 0px' });
    visibilityObserver.observe(parent);
    resize();

    return () => {
      inputRef.current = null;
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [inputRef, reduceMotion]);

  return <canvas ref={canvasRef} className="footer-splash-canvas" aria-hidden="true" />;
}

function SharkLink({ href, target, label, id, attacked, icon, children, onAttack, onFocusLink }: {
  href: string;
  target?: '_blank';
  label: string;
  id: string;
  attacked: boolean;
  icon?: ReactNode;
  children: ReactNode;
  onAttack: (event: ReactMouseEvent<HTMLAnchorElement>, id: string, href: string, target?: '_blank') => void;
  onFocusLink: (anchor: HTMLAnchorElement) => void;
}) {
  const anchorRef = useRef<HTMLAnchorElement>(null);

  return (
    <a
      ref={anchorRef}
      className={`shark-link${attacked ? ' is-attacked' : ''}`}
      href={href}
      target={target}
      rel={target === '_blank' ? 'noreferrer' : undefined}
      aria-label={label}
      onClick={(event) => onAttack(event, id, href, target)}
      onFocus={() => { if (anchorRef.current) onFocusLink(anchorRef.current); }}
    >
      <span className="shark-link-text">
        {icon} {children}
      </span>
    </a>
  );
}

export function ContactFooter() {
  const footerRef = useRef<HTMLElementTagNameMap['footer']>(null);
  const waterInputRef = useRef<WaterInput | null>(null);
  const sharkRef = useRef<SharkInteraction>({ id: '', x: 0, y: 0, active: false, attacking: false, attackId: 0, attackStartedAt: 0 });
  const cursorRef = useRef({ x: 0, y: 0, at: 0, active: false });
  const [sharkVisible, setSharkVisible] = useState(false);
  const [attackedLinkId, setAttackedLinkId] = useState<string | null>(null);
  const redirectTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (redirectTimer.current !== null) window.clearTimeout(redirectTimer.current);
  }, []);

  const updateSharkPosition = (clientX: number, clientY: number) => {
    const footer = footerRef.current;
    if (!footer) return;
    const bounds = footer.getBoundingClientRect();
    sharkRef.current.x = clientX - bounds.left;
    sharkRef.current.y = clientY - bounds.top;
    sharkRef.current.active = true;
    setSharkVisible(true);
  };

  const handlePointerMove = (event: ReactMouseEvent<HTMLElement>) => {
    const now = performance.now();
    const previous = cursorRef.current;
    const dx = event.clientX - previous.x;
    const dy = event.clientY - previous.y;
    const distance = Math.hypot(dx, dy);
    updateSharkPosition(event.clientX, event.clientY);
    if (previous.active && distance > 4) {
      const speed = distance / Math.max(1, now - previous.at);
      waterInputRef.current?.(sharkRef.current.x, sharkRef.current.y, speed, Math.sign(dx || dy) || 1, false);
    }
    cursorRef.current = { x: event.clientX, y: event.clientY, at: now, active: true };
  };

  const handlePointerEnter = (event: ReactMouseEvent<HTMLElement>) => {
    cursorRef.current = { x: event.clientX, y: event.clientY, at: performance.now(), active: true };
    updateSharkPosition(event.clientX, event.clientY);
    waterInputRef.current?.(sharkRef.current.x, sharkRef.current.y, 0, 1, true);
  };

  const handlePointerDown = (event: ReactMouseEvent<HTMLElement>) => {
    handlePointerMove(event);
    waterInputRef.current?.(sharkRef.current.x, sharkRef.current.y, 0, 1, true);
  };

  const handlePointerLeave = () => {
    cursorRef.current.active = false;
    if (sharkRef.current.attacking) return;
    sharkRef.current.active = false;
    setSharkVisible(false);
  };

  const handleLinkFocus = (anchor: HTMLAnchorElement) => {
    const bounds = anchor.getBoundingClientRect();
    updateSharkPosition(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
  };

  const handleAttack = (event: ReactMouseEvent<HTMLAnchorElement>, id: string, href: string, target?: '_blank') => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || sharkRef.current.attacking) return;
    event.preventDefault();
    handleLinkFocus(event.currentTarget);
    sharkRef.current.attacking = true;
    sharkRef.current.attackId += 1;
    sharkRef.current.attackStartedAt = performance.now() / 1000;
    sharkRef.current.id = id;
    setAttackedLinkId(id);

    const destination = target === '_blank' ? window.open('about:blank', '_blank') : null;
    if (destination) destination.opener = null;
    if (redirectTimer.current !== null) window.clearTimeout(redirectTimer.current);
    redirectTimer.current = window.setTimeout(() => {
      if (destination && !destination.closed) destination.location.href = href;
      else window.location.assign(href);
    }, 1100);
  };

  return (
    <motion.footer
      ref={footerRef}
      id="contact"
      className="footer-shell"
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <FooterSplash inputRef={waterInputRef} />
      <FooterSharkScene interactionRef={sharkRef} active={sharkVisible} />
      <div className="footer-content">
        <div>
          <p className="section-kicker"><ScrambleText text="Contact" /></p>
          <h2><RevealWords text="Let's build something meaningful." /></h2>
        </div>

        <div className="contact-links">
          <SharkLink id="email" href={`mailto:${contact.email}`} label={contact.email} attacked={attackedLinkId === 'email'} icon={<Mail size={18} />} onAttack={handleAttack} onFocusLink={handleLinkFocus}>
            {contact.email}
          </SharkLink>
          {contact.showPhone ? (
            <SharkLink id="phone" href={contact.phoneHref} label={contact.phone} attacked={attackedLinkId === 'phone'} icon={<Phone size={18} />} onAttack={handleAttack} onFocusLink={handleLinkFocus}>
              {contact.phone}
            </SharkLink>
          ) : null}
          <SharkLink id="linkedin" href={contact.linkedin} target="_blank" label="LinkedIn" attacked={attackedLinkId === 'linkedin'} icon={<Linkedin size={18} />} onAttack={handleAttack} onFocusLink={handleLinkFocus}>LinkedIn</SharkLink>
          <SharkLink id="github" href={contact.github} target="_blank" label="GitHub" attacked={attackedLinkId === 'github'} icon={<Github size={18} />} onAttack={handleAttack} onFocusLink={handleLinkFocus}>GitHub</SharkLink>
          <SharkLink id="archive" href={contact.archive} label="2022 archive" attacked={attackedLinkId === 'archive'} onAttack={handleAttack} onFocusLink={handleLinkFocus}>2022 archive</SharkLink>
        </div>
      </div>
    </motion.footer>
  );
}

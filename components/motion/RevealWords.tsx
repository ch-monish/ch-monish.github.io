'use client';

import { motion, useReducedMotion } from 'framer-motion';

export function RevealWords({ text, onLoad = false }: { text: string; onLoad?: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <span className="sr-only">{text}</span>
      <span className="reveal-words" aria-hidden="true">
        {text.split(/\s+/).map((word, index) => (
          <span className="reveal-word-mask" key={`${word}-${index}`}>
            <motion.span
              className="reveal-word"
              initial={reduceMotion ? false : { y: '115%', rotateX: -48, opacity: 0 }}
              animate={onLoad ? { y: 0, rotateX: 0, opacity: 1 } : undefined}
              whileInView={!onLoad && !reduceMotion ? { y: 0, rotateX: 0, opacity: 1 } : undefined}
              viewport={!onLoad ? { once: true, amount: 0.65 } : undefined}
              transition={{ duration: reduceMotion ? 0 : 0.72, delay: reduceMotion ? 0 : index * 0.035, ease: [0.16, 1, 0.3, 1] }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </span>
    </>
  );
}

export function HeightRevealText({ text }: { text: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <span className="sr-only">{text}</span>
      <motion.span
        className="height-reveal-text"
        aria-hidden="true"
        initial={reduceMotion ? false : { height: 0, opacity: 0 }}
        whileInView={!reduceMotion ? { height: 'auto', opacity: 1 } : undefined}
        viewport={{ once: true, amount: 0.75 }}
        transition={{ duration: reduceMotion ? 0 : 0.72, ease: [0.16, 1, 0.3, 1] }}
      >
        {text}
      </motion.span>
    </>
  );
}

export const staggerReveal = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export const revealItem = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

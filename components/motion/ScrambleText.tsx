'use client';

import { useEffect, useRef, useState } from 'react';

export function ScrambleText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState(text);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => () => {
    if (animationFrame.current !== null) {
      window.cancelAnimationFrame(animationFrame.current);
    }
  }, []);

  const scramble = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (animationFrame.current !== null) {
      window.cancelAnimationFrame(animationFrame.current);
    }

    const startedAt = performance.now();
    const characterStep = 70;
    const characterStagger = 70;
    const characters = Array.from(text);
    const isLetter = (character: string) => /[a-z0-9]/i.test(character);
    const wordPools: string[][] = characters.map(() => []);
    let wordStart = 0;
    let letterCount = 0;

    while (wordStart < characters.length) {
      if (!isLetter(characters[wordStart])) {
        wordStart += 1;
        continue;
      }

      let wordEnd = wordStart + 1;
      while (wordEnd < characters.length && isLetter(characters[wordEnd])) wordEnd += 1;
      const pool = characters.slice(wordStart, wordEnd);
      for (let index = wordStart; index < wordEnd; index += 1) {
        wordPools[index] = pool;
        letterCount += 1;
      }

      wordStart = wordEnd;
    }

    const totalDuration = Math.max(0, (letterCount - 1) * characterStagger + characterStep * 2);
    let lastDisplay = '';

    const tick = (now: number) => {
      const elapsed = now - startedAt;
      let letterOrder = 0;
      const nextText = characters.map((character, index) => {
        if (!isLetter(character)) return character;

        const localTime = elapsed - letterOrder * characterStagger;
        const step = Math.floor(localTime / characterStep);
        letterOrder += 1;

        if (step < 0 || step >= 2) return character;
        const alternatives = wordPools[index].filter((candidate) => candidate !== character);
        if (alternatives.length === 0) return character;
        return alternatives[(index + step) % alternatives.length];
      }).join('');

      if (nextText !== lastDisplay) {
        setDisplayText(nextText);
        lastDisplay = nextText;
      }

      if (elapsed < totalDuration) {
        animationFrame.current = window.requestAnimationFrame(tick);
      } else {
        setDisplayText(text);
        animationFrame.current = null;
      }
    };

    animationFrame.current = window.requestAnimationFrame(tick);
  };

  return (
    <span className="scramble-text" onPointerEnter={scramble}>
      <span className="scramble-text__accessible">{text}</span>
      <span className="scramble-text__base" aria-hidden="true">{text}</span>
      <span className="scramble-text__visual" aria-hidden="true">
        {displayText}
      </span>
    </span>
  );
}

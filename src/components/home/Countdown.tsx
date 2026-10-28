import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCountdown } from '../../hooks/useCountdown';
import { MOTION_EASE } from '../../lib/motion';

interface CountdownProps {
  target: string;
}

// One digit that rolls: the old number drops out, the new one falls in from above.
const RollingDigit: React.FC<{ value: string; animate: boolean }> = ({ value, animate }) => (
  <span className="relative inline-block h-[1.15em] w-[0.62em] overflow-hidden text-center align-top">
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span
        key={value}
        initial={animate ? { y: '-70%', opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        exit={animate ? { y: '70%', opacity: 0 } : { opacity: 0 }}
        transition={{ duration: animate ? 0.38 : 0, ease: MOTION_EASE }}
        className="block leading-[1.15]"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  </span>
);

const Segment: React.FC<{ value: number; unit: string; animate: boolean }> = ({ value, unit, animate }) => {
  const chars = String(value).padStart(2, '0').split('');
  return (
    <div className="flex flex-col items-center">
      <div className="flex font-mono font-extrabold leading-none text-[var(--accent)]" aria-hidden="true">
        {chars.map((c, i) => (
          <RollingDigit key={chars.length - i} value={c} animate={animate} />
        ))}
      </div>
      <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-secondary)] sm:text-xs">
        {unit}
      </span>
    </div>
  );
};

const Colon: React.FC = () => (
  <span
    aria-hidden="true"
    className="animate-countdown-colon flex h-[1.15em] items-center pb-[0.08em] font-mono font-bold leading-none text-[var(--accent)]"
  >
    :
  </span>
);

const SWEEP_NODES = [0.25, 0.5, 0.75]; // 15s, 30s, 45s

// A trace that fills across each minute. It runs on requestAnimationFrame and writes
// straight to the DOM, so it stays perfectly smooth without re-rendering React.
const SweepTrace: React.FC<{ target: string }> = ({ target }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const litRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const lit = litRef.current;
    const head = headRef.current;
    if (!wrap || !lit || !head) return;

    const end = new Date(target).getTime();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = wrap.clientWidth;
    let raf = 0;
    let interval = 0;

    const ro = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
    });
    ro.observe(wrap);

    const paint = () => {
      const left = end - Date.now();
      const expired = left <= 0;
      const p = expired ? 1 : 1 - (left % 60000) / 60000;
      lit.style.transform = `scaleX(${p})`;
      head.style.transform = `translateX(${p * width}px)`;
      nodeRefs.current.forEach((n, i) => {
        if (n) n.dataset.lit = p >= SWEEP_NODES[i] ? '1' : '0';
      });
      if (expired) return;
      if (!reduce) raf = requestAnimationFrame(paint);
    };

    paint();
    if (reduce) interval = window.setInterval(paint, 1000);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
      ro.disconnect();
    };
  }, [target]);

  return (
    <div ref={wrapRef} aria-hidden="true" className="relative mt-6 h-3">
      <div className="absolute inset-x-0 top-1/2 h-px bg-[var(--border-color)]" />
      <div
        ref={litRef}
        className="absolute inset-x-0 top-1/2 h-px origin-left bg-[var(--accent)] will-change-transform"
        style={{ transform: 'scaleX(0)' }}
      />
      {SWEEP_NODES.map((n, i) => (
        <span
          key={n}
          ref={(el) => {
            nodeRefs.current[i] = el;
          }}
          data-lit="0"
          style={{ left: `${n * 100}%` }}
          className="absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--text-secondary)] bg-[var(--bg-surface)] transition-colors duration-150 data-[lit=1]:border-[var(--accent)] data-[lit=1]:bg-[var(--accent)]"
        />
      ))}
      <div
        ref={headRef}
        className="absolute left-0 top-1/2 -ml-1 -mt-1 h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_10px_2px_var(--accent)] will-change-transform"
        style={{ transform: 'translateX(0px)' }}
      />
    </div>
  );
};

export const Countdown: React.FC<CountdownProps> = ({ target }) => {
  const c = useCountdown(target);
  const reduce = useReducedMotion();
  const animate = !reduce;

  return (
    <div className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 shadow-lg sm:p-6">
      <p className="mb-5 flex items-center justify-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
        {c.isExpired ? 'Compute 50' : 'Hackathon starts in'}
      </p>

      {c.isExpired ? (
        <p className="py-3 text-center font-mono text-2xl font-extrabold text-[var(--accent)] sm:text-4xl">
          The wait is over
        </p>
      ) : (
        <div
          role="timer"
          aria-label={`${c.days} days, ${c.hours} hours and ${c.minutes} minutes until the hackathon starts`}
          className="flex items-start justify-center gap-1.5 text-[2.6rem] sm:gap-4 sm:text-6xl"
        >
          <Segment value={c.days} unit="days" animate={animate} />
          <Colon />
          <Segment value={c.hours} unit="hrs" animate={animate} />
          <Colon />
          <Segment value={c.minutes} unit="min" animate={animate} />
          <Colon />
          <Segment value={c.seconds} unit="sec" animate={animate} />
        </div>
      )}

      <SweepTrace target={target} />
    </div>
  );
};

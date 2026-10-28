import React, { useEffect, useState, useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

interface CountUpProps {
  value: string;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({ value, className = '' }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();

  // Parse numeric part and non-numeric suffix (e.g., "300+" -> 300, "+")
  const numericMatch = value.match(/\d+/);
  const targetNumber = numericMatch ? parseInt(numericMatch[0], 10) : 0;
  const suffix = value.replace(/\d+/, '');

  const [displayNumber, setDisplayNumber] = useState(shouldReduceMotion ? targetNumber : 0);

  useEffect(() => {
    if (!isInView || shouldReduceMotion) {
      if (shouldReduceMotion) setDisplayNumber(targetNumber);
      return;
    }

    let start = 0;
    const duration = 1200; // ms
    const steps = 30;
    const increment = targetNumber / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetNumber) {
        setDisplayNumber(targetNumber);
        clearInterval(timer);
      } else {
        setDisplayNumber(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, targetNumber, shouldReduceMotion]);

  return (
    <span ref={ref} className={className}>
      {displayNumber}
      {suffix}
    </span>
  );
};

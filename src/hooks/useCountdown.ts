import { useState, useEffect } from 'react';

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const calculateTimeLeft = (targetDate: string | Date): CountdownTime => {
  const difference = new Date(targetDate).getTime() - Date.now();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  return {
    days: Math.floor(difference / DAY),
    hours: Math.floor((difference % DAY) / HOUR),
    minutes: Math.floor((difference % HOUR) / MINUTE),
    seconds: Math.floor((difference % MINUTE) / SECOND),
    isExpired: false,
  };
};

export const useCountdown = (targetDate: string | Date): CountdownTime => {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    // Wake just after each real second boundary (not on a free-running 1s interval),
    // so the digits flip exactly when the clock does and never drift.
    const schedule = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      timer = setTimeout(tick, (diff % SECOND) + 8);
    };
    const tick = () => {
      const next = calculateTimeLeft(targetDate);
      setTimeLeft(next);
      if (!next.isExpired) schedule();
    };

    schedule();
    return () => clearTimeout(timer);
  }, [targetDate]);

  return timeLeft;
};

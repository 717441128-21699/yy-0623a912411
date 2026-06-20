import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerOptions {
  initialTime: number;
  onTimeUp?: () => void;
  autoStart?: boolean;
}

interface UseTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  isPaused: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (newTime?: number) => void;
  percentage: number;
}

export const useTimer = ({
  initialTime,
  onTimeUp,
  autoStart = true,
}: UseTimerOptions): UseTimerReturn => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimer();
    setTimeLeft(initialTime);
    setIsRunning(true);
    setIsPaused(false);
  }, [initialTime, clearTimer]);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const reset = useCallback((newTime?: number) => {
    clearTimer();
    setTimeLeft(newTime ?? initialTime);
    setIsRunning(autoStart);
    setIsPaused(false);
  }, [initialTime, autoStart, clearTimer]);

  useEffect(() => {
    if (!isRunning || isPaused) {
      clearTimer();
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          onTimeUpRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, isPaused, clearTimer]);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  const percentage = initialTime > 0 ? (timeLeft / initialTime) * 100 : 0;

  return {
    timeLeft,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    reset,
    percentage,
  };
};

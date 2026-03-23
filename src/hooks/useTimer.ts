import { useCallback, useEffect, useRef, useState } from 'react';
import { TIMER_THRESHOLDS } from '../constants';
import type { TimerPhase } from '../types';

interface UseTimerOptions {
  /** Total duration in seconds. */
  duration: number;
  /** Fired once when remaining reaches 0. */
  onExpire: () => void;
  /** Start counting immediately on mount. Default false. */
  autoStart?: boolean;
}

interface UseTimerReturn {
  /** Seconds left (integer). */
  remaining: number;
  /** Original duration passed in. */
  total: number;
  /** Whether the timer is currently counting down. */
  isRunning: boolean;
  /** Visual phase based on thresholds: normal → warning → urgent. */
  phase: TimerPhase;
  /** 0 → 1 progress (0 = full time left, 1 = expired). */
  progress: number;
  /** Start or resume. */
  start: () => void;
  /** Pause without resetting. */
  pause: () => void;
  /** Reset to full duration and stop. */
  reset: () => void;
}

function getTimerPhase(remaining: number, total: number): TimerPhase {
  if (total === 0) return 'normal';
  const ratio = remaining / total;
  if (ratio <= TIMER_THRESHOLDS.urgentRatio) return 'urgent';
  if (ratio <= TIMER_THRESHOLDS.warningRatio) return 'warning';
  return 'normal';
}

export function useTimer({
  duration,
  onExpire,
  autoStart = false,
}: UseTimerOptions): UseTimerReturn {
  const [remaining, setRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);

  // Stable reference to onExpire so we never need it in deps
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Track whether we've already fired onExpire for this cycle
  const hasFiredRef = useRef(false);

  // Interval-based countdown (1 s tick)
  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(id);
          setIsRunning(false);
          if (!hasFiredRef.current) {
            hasFiredRef.current = true;
            // Fire asynchronously so we don't setState during render
            queueMicrotask(() => onExpireRef.current());
          }
          return 0;
        }
        return next;
      });
    }, 1_000);

    return () => clearInterval(id);
  }, [isRunning]);

  // ── Controls ──

  const start = useCallback(() => {
    if (remaining > 0) setIsRunning(true);
  }, [remaining]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setRemaining(duration);
    hasFiredRef.current = false;
  }, [duration]);

  // ── Derived values ──

  const total = duration;
  const progress = total === 0 ? 1 : 1 - remaining / total;
  const phase = getTimerPhase(remaining, total);

  return { remaining, total, isRunning, phase, progress, start, pause, reset };
}

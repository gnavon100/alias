import type { TimerPhase } from '../types';

interface TimerDisplayProps {
  remaining: number;
  total: number;
  phase: TimerPhase;
  progress: number;
}

const PHASE_COLORS: Record<TimerPhase, { ring: string; text: string }> = {
  normal: { ring: 'stroke-timer-normal', text: 'text-timer-normal' },
  warning: { ring: 'stroke-timer-warning', text: 'text-timer-warning' },
  urgent: { ring: 'stroke-timer-urgent', text: 'text-timer-urgent' },
};

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function TimerDisplay({
  remaining,
  phase,
  progress,
}: TimerDisplayProps) {
  const colors = PHASE_COLORS[phase];
  const dashOffset = CIRCUMFERENCE * progress;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display =
    minutes > 0
      ? `${minutes}:${String(seconds).padStart(2, '0')}`
      : String(seconds);

  return (
    <div
      className={`relative w-32 h-32 mx-auto ${
        phase === 'urgent' ? 'animate-pulse-urgent' : ''
      }`}
    >
      {/* SVG ring */}
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        {/* Background ring */}
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          className="stroke-slate-700"
          strokeWidth="8"
        />
        {/* Progress ring */}
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          className={`${colors.ring} transition-all duration-1000 ease-linear`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
        />
      </svg>

      {/* Time text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-3xl font-black tabular-nums ${colors.text}`}>
          {display}
        </span>
      </div>
    </div>
  );
}

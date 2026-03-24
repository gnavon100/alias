import { useCallback, useRef } from 'react';

/**
 * Synthesised sound effects using the Web Audio API via Howler.js.
 * We use inline data URIs generated from very short WAV tones so
 * the game ships with zero external audio assets.
 *
 * For a production app you'd swap these with proper .mp3/.ogg files.
 * For now, we use Howler purely for cross-browser consistency and
 * fall back to the empty Howl constructor which is silent.
 */

let audioCtx: AudioContext | null = null;
let globalMuted = false;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function setGlobalMute(muted: boolean): void {
  globalMuted = muted;
}

export function isGlobalMuted(): boolean {
  return globalMuted;
}

/**
 * Play a short synthesized beep using Web Audio API directly.
 * This avoids needing audio files entirely.
 */
function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3,
) {
  if (globalMuted) return;
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available — silent fallback
  }
}

function playChord(frequencies: number[], duration: number, volume = 0.15) {
  for (const freq of frequencies) {
    playTone(freq, duration, 'sine', volume);
  }
}

// ── Sound effect functions ──

function playCorrect() {
  // Bright ascending two-tone
  playTone(523, 0.1, 'square', 0.2); // C5
  setTimeout(() => playTone(659, 0.15, 'square', 0.2), 80); // E5
}

function playSkip() {
  // Low descending buzz
  playTone(220, 0.15, 'sawtooth', 0.15); // A3
}

function playTimeUp() {
  // Alarm-style triple beep
  playTone(880, 0.12, 'square', 0.25);
  setTimeout(() => playTone(880, 0.12, 'square', 0.25), 180);
  setTimeout(() => playTone(880, 0.2, 'square', 0.3), 360);
}

function playTick() {
  // Soft click
  playTone(1200, 0.03, 'sine', 0.1);
}

function playWin() {
  // Triumphant ascending arpeggio
  playChord([523, 659, 784], 0.3, 0.12); // C major
  setTimeout(() => playChord([587, 740, 880], 0.3, 0.12), 250); // D major
  setTimeout(() => playChord([659, 831, 988], 0.5, 0.15), 500); // E major
}

// ── Export for use outside React ──
export const SFX = {
  correct: playCorrect,
  skip: playSkip,
  timeUp: playTimeUp,
  tick: playTick,
  win: playWin,
};

// ── React hook for convenient usage ──

export function useAudio() {
  const enabledRef = useRef(true);

  const play = useCallback((sound: keyof typeof SFX) => {
    if (!enabledRef.current) return;
    SFX[sound]();
  }, []);

  const toggle = useCallback(() => {
    enabledRef.current = !enabledRef.current;
    return enabledRef.current;
  }, []);

  return { play, toggle, isEnabled: () => enabledRef.current };
}

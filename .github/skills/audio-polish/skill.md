---
name: hebrew-alias-audio-polish
description: 'Audio and visual polish specification for the Hebrew Alias board game. Covers sound effects, hourglass animation, timer urgency effects, and confetti.'
---

# Hebrew Alias — Audio & Visual Polish Specification

## 1. Sounds
| Sound | File | Required | Trigger |
|-------|------|----------|---------|
| Time Up | `time-up.mp3` | ✅ | Timer reaches 0 |
| Correct | `correct.mp3` | ❌ | Correct tap |
| Skip | `skip.mp3` | ❌ | Skip tap |
| Tick | `tick.mp3` | ❌ | Last 5 seconds |
| Victory | `victory.mp3` | ❌ | Game over |

## 2. useAudio Hook
- Howler.js wrapper, preloads on mount
- `play(sound: SoundName)`, mute toggle in localStorage
- Graceful degradation on load failure

## 3. Hourglass
- SVG with top/bottom sand chambers
- Sand height synced to timer progress
- Color: green → yellow → red by phase

## 4. Urgency Effects
- CSS `pulseUrgent` keyframes (red glow, 0.6s loop)
- Background tint: none → yellow/10 → red/10
- Respects `prefers-reduced-motion`

## 5. Victory
- `canvas-confetti` library (~4KB)
- 3-second burst from both sides
- Trophy bounce (Framer Motion spring)

## 6. Extras
- Haptic feedback: `navigator.vibrate(10)`
- Wake lock during TURN phase
- Team turn splash (1.5s color overlay)
- Mute toggle with localStorage persistence

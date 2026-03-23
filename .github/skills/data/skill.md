---
name: hebrew-alias-data
description: 'Data specification for the Hebrew Alias board game. Covers word dataset schema, word selection algorithm, and session-level deduplication.'
---

# Hebrew Alias — Data Specification

## 1. Schema (`src/data/words.json`)
```json
{ "words": [{ "word": "שולחן", "difficulty": "easy" }] }
```
- `word`: Hebrew string (required)
- `difficulty`: `"easy"|"medium"|"hard"` (optional, defaults to `"medium"`)

## 2. Requirements
- Minimum 100 words, recommended 500–1000
- UTF-8 JSON, no BOM, no duplicates
- Static import via Vite (bundled at build time)

## 3. Word Selection Algorithm
1. On init: Fisher-Yates shuffle entire array, pointer = 0
2. On draw: return `array[pointer++]`
3. On exhaustion: re-shuffle, pointer = 0
4. Guarantee: no repeats within a single pass

## 4. Utilities (`src/utils/wordSelection.ts`)
- `validateDataset(data) → Word[]`
- `fisherYatesShuffle<T>(array) → T[]`
- `initWordSelection(words) → { shuffledWords, currentWordIndex }`
- `drawNextWord(state) → { word, newState }`

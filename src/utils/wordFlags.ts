/**
 * Word Flagging System - localStorage utilities
 * Stores flagged words locally and manages email submission
 */

const STORAGE_KEY = 'alias-flagged-words';

export interface FlaggedWord {
  word: string;
  timestamp: number;
}

/**
 * Add a word to the flagged list
 */
export const flagWord = (word: string): void => {
  // Validate input
  if (!word || typeof word !== 'string' || word.length === 0 || word.length > 200) {
    console.warn('Invalid word for flagging:', word);
    return;
  }
  
  const flags = getFlaggedWords();
  
  // Avoid duplicates
  if (!flags.some(f => f.word === word)) {
    flags.push({
      word,
      timestamp: Date.now()
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  }
};

/**
 * Validate that data is a valid FlaggedWord
 */
const isValidFlaggedWord = (obj: any): obj is FlaggedWord => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.word === 'string' &&
    typeof obj.timestamp === 'number' &&
    obj.word.length > 0 &&
    obj.word.length <= 200 &&
    obj.timestamp > 0
  );
};

/**
 * Get all flagged words
 */
export const getFlaggedWords = (): FlaggedWord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    
    // Filter and validate each entry
    return parsed.filter(isValidFlaggedWord);
  } catch {
    return [];
  }
};

/**
 * Check if a word is already flagged
 */
export const isWordFlagged = (word: string): boolean => {
  return getFlaggedWords().some(f => f.word === word);
};

/**
 * Clear all flagged words (after successful email send)
 */
export const clearFlaggedWords = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Get count of flagged words
 */
export const getFlaggedWordsCount = (): number => {
  return getFlaggedWords().length;
};

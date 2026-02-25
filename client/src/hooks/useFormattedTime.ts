import { useMemo } from 'react';

/**
 * Formats seconds into a mm:ss display string.
 * Returns a memoised value that updates when `seconds` changes.
 */
export function useFormattedTime(seconds: number): string {
  return useMemo(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [seconds]);
}

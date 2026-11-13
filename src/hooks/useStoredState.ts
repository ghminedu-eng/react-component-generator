import { useEffect, useState } from 'react';

export function useStoredState<T>(key: string, fallback: T, restore: (value: unknown) => T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored === null ? fallback : restore(JSON.parse(stored));
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage restrictions or quota exhaustion must not interrupt generation.
    }
  }, [key, value]);

  return [value, setValue] as const;
}

import { useCallback, useEffect, useState } from 'react';

/**
 * Custom React hook to manage state with localStorage, syncing updates across browser tabs.
 * Provides a value stored in localStorage and an updater function to modify it.
 *
 * @template T - The type of the state value to be stored.
 * @param {string} storageKey - The localStorage key under which the state is saved.
 * @param {T} fallbackState - The initial value to be used if no item exists in localStorage.
 * @returns {[T, (newValue: T) => void]} - An array containing the current state value and a function to update it.
 */
function useLocalStorage<T>(storageKey: string, fallbackState: T) {
  const isClient = typeof window !== 'undefined';

  const [value, setValue] = useState<T>(() => {
    if (isClient) {
      const storedValue = localStorage.getItem(storageKey);
      return storedValue ? JSON.parse(storedValue) : fallbackState;
    }
    return fallbackState;
  });

  useEffect(() => {
    if (isClient) {
      const storedValue = localStorage.getItem(storageKey);
      setValue(storedValue ? JSON.parse(storedValue) : fallbackState);
    }
  }, [storageKey, isClient]);

  useEffect(() => {
    const handleChanges = (e: StorageEvent) => {
      if (e.key === storageKey) {
        setValue(e.newValue ? JSON.parse(e.newValue) : fallbackState);
      }
    }
    if (isClient) {
      window.addEventListener('storage', handleChanges);
    }
    return () => {
      if (isClient) {
        window.removeEventListener('storage', handleChanges);
      }
    };
  }, [storageKey, fallbackState, isClient]);

  const updateStorage = useCallback(
    (newValue: T) => {
      setValue(newValue)
      if (isClient) {
        localStorage.setItem(storageKey, JSON.stringify(newValue))
      }
    },
    [storageKey, isClient]
  )

  return [value, updateStorage] as const;
};

export default useLocalStorage
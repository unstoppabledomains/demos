import { useCallback, useEffect, useState } from 'react';

function useLocalStorage<T>(storageKey: string, fallbackState: T) {
    const [value, setValue] = useState<T>(fallbackState);
    const isClient = typeof window !== 'undefined';

    useEffect(() => {
        setValue(isClient ? JSON.parse(localStorage.getItem(storageKey) || '""') : fallbackState);
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
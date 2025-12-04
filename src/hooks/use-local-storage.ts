import { useCallback, useSyncExternalStore } from "react";

type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();

function getListeners(key: string): Set<Listener> {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  return listeners.get(key)!;
}

function notifyListeners(key: string) {
  getListeners(key).forEach((listener) => listener());
}

function getStorageValue<T>(key: string, initialValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch {
    return initialValue;
  }
}

function setStorageValue<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    notifyListeners(key);
  } catch (error) {
    console.error(`Error saving to localStorage key "${key}":`, error);
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const subscribe = useCallback(
    (listener: Listener) => {
      const keyListeners = getListeners(key);
      keyListeners.add(listener);

      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key) {
          notifyListeners(key);
        }
      };
      window.addEventListener("storage", handleStorageChange);

      return () => {
        keyListeners.delete(listener);
        window.removeEventListener("storage", handleStorageChange);
      };
    },
    [key]
  );

  const getSnapshot = useCallback(() => {
    return window.localStorage.getItem(key);
  }, [key]);

  const rawValue = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const value: T = rawValue ? JSON.parse(rawValue) : initialValue;

  const setValue = useCallback(
    (newValue: T | ((val: T) => T)) => {
      const currentValue = getStorageValue<T>(key, initialValue);
      const valueToStore = newValue instanceof Function ? newValue(currentValue) : newValue;
      setStorageValue(key, valueToStore);
    },
    [key, initialValue]
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      notifyListeners(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key]);

  return { value, setValue, removeValue };
}

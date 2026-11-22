"use client";

import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked – ignore */
  }
}

/**
 * useState that is read from / written to localStorage.
 * `merge` lets callers fill in fields that older saved versions lack.
 */
export function usePersistentState<T>(
  key: string,
  init: () => T,
  merge?: (stored: unknown) => T
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return init();
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed = JSON.parse(raw) as unknown;
        return merge ? merge(parsed) : (parsed as T);
      }
    } catch {
      /* fall through to init */
    }
    return init();
  });

  useEffect(() => {
    writeStorage(key, state);
  }, [key, state]);

  return [state, setState];
}

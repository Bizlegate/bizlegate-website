import { useSyncExternalStore } from "react";

/**
 * Shared open/closed state for the single quiz dialog instance rendered
 * once on the page (see book-quiz-dialog.tsx). Two independent triggers
 * need to open the same dialog — the exit-intent "leave attempt" popup
 * (use-exit-intent.ts) and the mid-page "Take the Free Diagnostic" button
 * (book-preview-cta.tsx) — so this is a tiny module-scoped store instead
 * of prop-drilling or pulling in a state library for one boolean.
 */
let isOpen = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function openBookQuiz() {
  isOpen = true;
  emit();
}

export function closeBookQuiz() {
  isOpen = false;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return isOpen;
}

export function useBookQuizOpen(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot);
}

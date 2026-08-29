import { useEffect, useState } from "react";
import { openBookQuiz } from "./use-quiz-dialog.ts";

const PREVIEW_KEY = "book.exit.previewShown";
const QUIZ_KEY = "book.exit.quizShown";
const BUY_CLICKED_KEY = "book.buyClicked";

const IDLE_MS = 30000;

function readFlag(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function writeFlag(key: string) {
  try {
    sessionStorage.setItem(key, "true");
  } catch {
    // best-effort only — worst case a reload within the same session
    // shows a popup again instead of staying silent
  }
}

/** Call from a "Get the Book" button so neither popup fires again once
 * someone has actually tried to buy. */
export function markBuyClicked() {
  writeFlag(BUY_CLICKED_KEY);
}

function hasClickedBuy(): boolean {
  return readFlag(BUY_CLICKED_KEY);
}

/**
 * Two independent "don't lose the visitor" popups for the /book page, each
 * tied to a different real behavior rather than to each other — this isn't
 * a fixed 1st-try/2nd-try sequence, either can fire on its own, and both
 * are permanently retired the moment someone clicks a "Get the Book"
 * button.
 *
 * 1. Idle 30 seconds (no mouse move, scroll, key press, or touch) → the
 *    free-preview popup (the Author's Note in full — see book-data.ts for
 *    why that's the only free content on this page). A visitor who's
 *    stalled out mid-page gets pulled back in with something to read.
 *
 * 2. A genuine attempt to leave → the quiz popup. This is two signals
 *    feeding the same trigger, because neither alone is fully reliable:
 *      - Desktop "exit intent": the mouse leaving through the TOP of the
 *        viewport toward the browser chrome. Closing a tab, hitting back,
 *        typing a new URL — all of these start with the cursor moving up
 *        and off the page, so this is a strong, standard signal, and it
 *        doesn't interrupt the visitor with anything native.
 *      - `beforeunload` (an actual close/navigate-away attempt, e.g. Ctrl+W
 *        or the tab's own × button): the browser will only ever show ITS
 *        OWN plain "Leave site?" dialog here — no browser lets a website
 *        replace that with custom UI, that door was closed years ago to
 *        stop abusive pages from trapping people. If the visitor clicks
 *        "Cancel" (stays), the page survives and we treat that as the
 *        signal to bring up our own quiz popup right after. If they click
 *        "Leave", the page unloads and nothing further can be shown.
 *        Caveat: some browsers only arm this dialog once the visitor has
 *        interacted with the page at least once (a click, a keypress) — a
 *        visitor who never touches the page may not see it at all. That's
 *        a platform limitation, not something fixable from here.
 *    Mobile has no mouse, so only the beforeunload half of this applies
 *    there, and even that is inconsistent across mobile browsers.
 *
 * The quiz popup itself is a single shared dialog instance (see
 * use-quiz-dialog.ts / book-quiz-dialog.tsx) that this trigger opens
 * through openBookQuiz() — the same dialog the mid-page "Take the Free
 * Diagnostic" button opens directly, so there's only ever one quiz UI on
 * the page regardless of which entry point triggered it.
 */
export function useExitIntent(): {
  showPreview: boolean;
  dismissPreview: () => void;
} {
  const [showPreview, setShowPreview] = useState(false);

  // --- Trigger 1: 30s idle → preview popup ---
  useEffect(() => {
    if (hasClickedBuy() || readFlag(PREVIEW_KEY)) return;

    let idleTimer: number;
    function fire() {
      if (hasClickedBuy() || readFlag(PREVIEW_KEY)) return;
      writeFlag(PREVIEW_KEY);
      setShowPreview(true);
    }
    function resetTimer() {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(fire, IDLE_MS);
    }

    resetTimer();
    const activityEvents: (keyof DocumentEventMap)[] = [
      "mousemove",
      "scroll",
      "keydown",
      "touchstart",
    ];
    activityEvents.forEach((evt) =>
      document.addEventListener(evt, resetTimer, { passive: true }),
    );

    return () => {
      window.clearTimeout(idleTimer);
      activityEvents.forEach((evt) =>
        document.removeEventListener(evt, resetTimer),
      );
    };
  }, []);

  // --- Trigger 2: real leave attempt (mouseleave-top OR beforeunload-cancel) → quiz popup ---
  useEffect(() => {
    if (hasClickedBuy() || readFlag(QUIZ_KEY)) return;

    function fire() {
      if (hasClickedBuy() || readFlag(QUIZ_KEY)) return;
      writeFlag(QUIZ_KEY);
      openBookQuiz();
    }

    function onMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0 && !e.relatedTarget) {
        fire();
      }
    }

    let unloadAttempted = false;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      unloadAttempted = true;
      e.preventDefault();
      e.returnValue = "";
      // If the browser actually unloads the page, everything below never
      // runs. If the visitor cancels out of the native dialog, the page
      // survives and this fires shortly after — that's our "they tried to
      // leave and stayed" signal.
      window.setTimeout(() => {
        if (unloadAttempted) {
          unloadAttempted = false;
          fire();
        }
      }, 200);
    }

    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  return {
    showPreview,
    dismissPreview: () => setShowPreview(false),
  };
}

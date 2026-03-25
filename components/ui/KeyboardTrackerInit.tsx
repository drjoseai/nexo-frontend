"use client";

/**
 * KeyboardTrackerInit
 *
 * Client component that initializes the keyboard height tracker once,
 * on app startup. Must be rendered inside the root layout.
 * Renders nothing — purely a side-effect component.
 */

import { useEffect } from "react";

export function KeyboardTrackerInit() {
  useEffect(() => {
    import("@/lib/capacitor/keyboard").then(({ initKeyboardTracker }) => {
      initKeyboardTracker().catch(() => {
        // Silent fail — keyboard fix is best-effort
      });
    });
  }, []);

  return null;
}

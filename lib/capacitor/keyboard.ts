/**
 * Keyboard Height Tracker — NEXO
 *
 * Tracks keyboard height and exposes it via CSS custom property --keyboard-height.
 * Supports two environments:
 *   - Capacitor native (iOS/Android): uses @capacitor/keyboard plugin events
 *   - PWA / Web (Safari/Chrome): uses window.visualViewport resize events
 *
 * Usage: call initKeyboardTracker() once at app startup (in root layout).
 * Then use var(--keyboard-height, 0px) anywhere in CSS or inline styles.
 */

const CSS_VAR = "--keyboard-height";

function setKeyboardHeight(px: number): void {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty(CSS_VAR, `${Math.max(0, Math.round(px))}px`);
}

export async function initKeyboardTracker(): Promise<void> {
  if (typeof window === "undefined") return;

  // Initialize to 0
  setKeyboardHeight(0);

  // Try native Capacitor keyboard first
  try {
    const { Capacitor } = await import("@capacitor/core");

    if (Capacitor.isNativePlatform()) {
      const { Keyboard } = await import("@capacitor/keyboard");

      await Keyboard.addListener("keyboardWillShow", (info) => {
        setKeyboardHeight(info.keyboardHeight);
      });

      await Keyboard.addListener("keyboardWillHide", () => {
        setKeyboardHeight(0);
      });

      // Native listener registered — done
      return;
    }
  } catch {
    // Not native or @capacitor/keyboard not available — fall through to PWA approach
  }

  // PWA / Web fallback: visualViewport
  const vv = window.visualViewport;
  if (!vv) return;

  const update = () => {
    // keyboardHeight = total window height minus visible viewport height minus scroll offset
    const kbHeight = window.innerHeight - vv.height - vv.offsetTop;
    setKeyboardHeight(kbHeight);
  };

  vv.addEventListener("resize", update);
  vv.addEventListener("scroll", update);
}

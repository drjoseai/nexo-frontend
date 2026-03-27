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

      // Android: use Did* events (keyboard fully visible, layout stable).
      // iOS: use Will* events (coordinated with native spring animation).
      // Must use explicit branches — Capacitor addListener uses strict overloads
      // and does not accept dynamic string union types.
      if (Capacitor.getPlatform() === "android") {
        await Keyboard.addListener("keyboardDidShow", (info) => {
          setKeyboardHeight(info.keyboardHeight);
        });
        await Keyboard.addListener("keyboardDidHide", () => {
          setKeyboardHeight(0);
        });
      } else {
        await Keyboard.addListener("keyboardWillShow", (info) => {
          setKeyboardHeight(info.keyboardHeight);
        });
        await Keyboard.addListener("keyboardWillHide", () => {
          setKeyboardHeight(0);
        });
      }

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
    // keyboardHeight = total window height minus visible viewport height
    // NOTE: do NOT subtract vv.offsetTop — that value represents browser scroll
    // compensation which causes formula to underestimate keyboard height
    const kbHeight = window.innerHeight - vv.height;
    setKeyboardHeight(kbHeight);
  };

  vv.addEventListener("resize", update);
  vv.addEventListener("scroll", update);
}

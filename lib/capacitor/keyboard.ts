/**
 * Keyboard Height Tracker — NEXO
 *
 * Platform-aware keyboard handling:
 *
 * - Android native: adjustResize in AndroidManifest shrinks the WebView when
 *   the keyboard opens. Do NOT set --keyboard-height (would double-displace).
 *   Dispatch custom events so ChatInterface can trigger scroll-to-bottom.
 *   NOTE: visualViewport events do NOT fire on Android 15+ with adjustNothing
 *   (Capacitor issue #8070). With adjustResize the WebView resizes correctly.
 *
 * - iOS native: WKWebView does NOT resize on keyboard open.
 *   --keyboard-height + paddingBottom is the sole accommodation mechanism.
 *
 * - PWA / Web: visualViewport API detects keyboard height.
 *   --keyboard-height + paddingBottom handles accommodation.
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

  try {
    const { Capacitor } = await import("@capacitor/core");

    if (Capacitor.isNativePlatform()) {
      const { Keyboard } = await import("@capacitor/keyboard");

      if (Capacitor.getPlatform() === "android") {
        // Android: adjustResize handles keyboard accommodation natively.
        // Do NOT set --keyboard-height — it would cause double displacement.
        // Dispatch custom events so UI components can scroll to bottom.
        await Keyboard.addListener("keyboardDidShow", () => {
          window.dispatchEvent(new CustomEvent("nexo:keyboard-shown"));
        });
        await Keyboard.addListener("keyboardDidHide", () => {
          window.dispatchEvent(new CustomEvent("nexo:keyboard-hidden"));
        });
      } else {
        // iOS: WKWebView does NOT resize on keyboard open.
        // keyboardWillShow fires in sync with native spring animation.
        await Keyboard.addListener("keyboardWillShow", (info) => {
          setKeyboardHeight(info.keyboardHeight);
        });
        await Keyboard.addListener("keyboardWillHide", () => {
          setKeyboardHeight(0);
        });
      }

      // Native listeners registered — done
      return;
    }
  } catch {
    // Not native — fall through to PWA approach
  }

  // PWA / Web: visualViewport (works in all browsers including iOS Safari)
  const vv = window.visualViewport;
  if (!vv) return;

  const update = () => {
    const kbHeight = Math.max(0, Math.round(window.innerHeight - vv.height));
    setKeyboardHeight(kbHeight);
  };

  vv.addEventListener("resize", update);
  vv.addEventListener("scroll", update);
}

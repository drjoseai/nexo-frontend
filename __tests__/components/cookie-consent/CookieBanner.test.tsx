/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { CookieBanner } from "@/components/cookie-consent/CookieBanner";

const STORAGE_KEY = "nexo_cookie_consent";

const enTranslations: Record<string, string> = {
  "banner.title": "Cookie Preferences",
  "banner.description":
    "We use essential cookies for app functionality and optional analytics cookies to improve your experience.",
  "banner.acceptAll": "Accept All",
  "banner.rejectNonEssential": "Reject Non-Essential",
  "banner.managePreferences": "Manage Preferences",
  "banner.savePreferences": "Save Preferences",
  "categories.essential.title": "Essential",
  "categories.essential.description":
    "Required for authentication, security, and basic functionality. Cannot be disabled.",
  "categories.analytics.title": "Analytics",
  "categories.analytics.description":
    "Help us understand how you use NEXO to improve the experience. Powered by Mixpanel.",
};

const esTranslations: Record<string, string> = {
  "banner.title": "Preferencias de Cookies",
  "banner.description":
    "Usamos cookies esenciales para el funcionamiento de la app y cookies opcionales de analítica para mejorar tu experiencia.",
  "banner.acceptAll": "Aceptar Todas",
  "banner.rejectNonEssential": "Rechazar No Esenciales",
  "banner.managePreferences": "Administrar Preferencias",
  "banner.savePreferences": "Guardar Preferencias",
  "categories.essential.title": "Esenciales",
  "categories.essential.description":
    "Necesarias para autenticación, seguridad y funcionalidad básica. No se pueden desactivar.",
  "categories.analytics.title": "Analítica",
  "categories.analytics.description":
    "Nos ayudan a entender cómo usas NEXO para mejorar la experiencia. Impulsado por Mixpanel.",
};

let activeTranslations = enTranslations;

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => activeTranslations[key] || key,
}));

describe("CookieBanner", () => {
  beforeEach(() => {
    localStorage.clear();
    activeTranslations = enTranslations;
  });

  it("renders when no consent is stored", () => {
    render(<CookieBanner />);

    expect(screen.getByText("Cookie Preferences")).toBeInTheDocument();
    expect(screen.getByText("Accept All")).toBeInTheDocument();
    expect(screen.getByText("Reject Non-Essential")).toBeInTheDocument();
    expect(screen.getByText("Manage Preferences")).toBeInTheDocument();
  });

  it("does not render when consent already exists", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        essential: true,
        analytics: true,
        timestamp: new Date().toISOString(),
        version: "1.0",
      })
    );

    const { container } = render(<CookieBanner />);
    expect(container.innerHTML).toBe("");
  });

  it("Accept All saves consent with analytics=true and hides banner", () => {
    render(<CookieBanner />);

    fireEvent.click(screen.getByText("Accept All"));

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.essential).toBe(true);
    expect(stored.analytics).toBe(true);
    expect(stored.version).toBe("1.0");

    expect(screen.queryByText("Cookie Preferences")).not.toBeInTheDocument();
  });

  it("Reject Non-Essential saves consent with analytics=false and hides banner", () => {
    render(<CookieBanner />);

    fireEvent.click(screen.getByText("Reject Non-Essential"));

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.essential).toBe(true);
    expect(stored.analytics).toBe(false);

    expect(screen.queryByText("Cookie Preferences")).not.toBeInTheDocument();
  });

  it("Manage Preferences shows preference toggles", () => {
    render(<CookieBanner />);

    fireEvent.click(screen.getByText("Manage Preferences"));

    expect(screen.getByText("Essential")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Save Preferences")).toBeInTheDocument();
  });

  it("displays texts in Spanish", () => {
    activeTranslations = esTranslations;

    render(<CookieBanner />);

    expect(screen.getByText("Preferencias de Cookies")).toBeInTheDocument();
    expect(screen.getByText("Aceptar Todas")).toBeInTheDocument();
    expect(screen.getByText("Rechazar No Esenciales")).toBeInTheDocument();
    expect(screen.getByText("Administrar Preferencias")).toBeInTheDocument();
  });

  it("has correct aria attributes", () => {
    render(<CookieBanner />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-label", "Cookie Preferences");
  });
});

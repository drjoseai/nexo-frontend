/**
 * Tests for SettingsContent Component
 * NEXO v2.0
 *
 * @module __tests__/components/settings/SettingsContent.test
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { SettingsContent } from "@/components/settings/SettingsContent";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    const translations: Record<string, Record<string, string>> = {
      settings: {
        title: "Configuración",
        subtitle: "Personaliza tu experiencia",
        dataPrivacy: "Datos y Privacidad",
        dataPrivacyDescription: "Gestiona tus datos personales",
        termsOfService: "Términos de Servicio",
        termsOfServiceDescription: "Lee nuestros términos",
        view: "Ver",
        privacyPolicy: "Política de Privacidad",
        privacyPolicyDescription: "Lee nuestra política",
        dataEncryptionNotice: "Tus datos están encriptados",
        language: "Idioma",
        languageDescription: "Selecciona tu idioma preferido",
        preferredLanguage: "Idioma preferido",
        aboutNexo: "Acerca de NEXO",
        aboutNexoDescription: "Información de la aplicación",
        version: "Versión",
        support: "Soporte",
        madeBy: "Creado por",
        dangerZone: "Zona de Peligro",
        dangerZoneDescription: "Acciones irreversibles",
        deleteAccount: "Eliminar Cuenta",
        deleteAccountDescription: "Esta acción es permanente",
        deleteAccountConfirmTitle: "¿Estás seguro?",
        deleteAccountConfirmDescription: "Esta acción no se puede deshacer:",
        deleteAccountItem1: "Se eliminarán tus conversaciones",
        deleteAccountItem2: "Se eliminarán tus datos",
        deleteAccountItem3: "Se cancelará tu suscripción",
        deleteAccountItem4: "No podrás recuperar tu cuenta",
        deleteAccountConfirm: "Sí, eliminar cuenta",
      },
      common: {
        cancel: "Cancelar",
      },
    };
    return (key: string) => translations[namespace]?.[key] || key;
  },
}));

// Mock auth store
const mockLogout = jest.fn();
jest.mock("@/lib/store/auth", () => ({
  useAuthStore: jest.fn(() => ({ logout: mockLogout })),
}));

// Mock lucide-react
jest.mock("lucide-react", () => ({
  Globe: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-globe" {...props} />
  ),
  Trash2: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-trash" {...props} />
  ),
  Loader2: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-loader" {...props} />
  ),
  Shield: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-shield" {...props} />
  ),
  Info: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-info" {...props} />
  ),
}));

// Mock sonner
const mockToastError = jest.fn();
jest.mock("sonner", () => ({
  toast: { error: (...args: unknown[]) => mockToastError(...args) },
}));

// Mock UI components
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, variant, asChild, ...props }: any) => {
    if (asChild) {
      return <span data-variant={variant}>{children}</span>;
    }
    return (
      <button onClick={onClick} disabled={disabled} data-variant={variant} {...props}>
        {children}
      </button>
    );
  },
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="card" {...props}>{children}</div>
  ),
  CardContent: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  ),
  CardDescription: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props}>{children}</p>
  ),
  CardHeader: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  ),
  CardTitle: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 {...props}>{children}</h3>
  ),
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label {...props}>{children}</label>
  ),
}));

// Mock Select — render as native-like structure for testability
jest.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select-root" data-value={value}>
      {React.Children.map(children, (child: React.ReactElement) =>
        child ? React.cloneElement(child, { value, onValueChange } as any) : null
      )}
    </div>
  ),
  SelectTrigger: ({ children, ...props }: any) => (
    <div data-testid="select-trigger" {...props}>{children}</div>
  ),
  SelectValue: () => <span data-testid="select-value" />,
  SelectContent: ({ children, value: _value, onValueChange }: any) => (
    <div data-testid="select-content">
      {React.Children.map(children, (child: React.ReactElement) =>
        child ? React.cloneElement(child, { onValueChange } as any) : null
      )}
    </div>
  ),
  SelectItem: ({ children, value, onValueChange, ...props }: any) => (
    <div
      data-testid={`select-item-${value}`}
      onClick={() => onValueChange?.(value)}
      {...props}
    >
      {children}
    </div>
  ),
}));

// Mock AlertDialog — render inline for testability
jest.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: any) => (
    <div data-testid="alert-dialog">{children}</div>
  ),
  AlertDialogTrigger: ({ children, asChild: _asChild }: any) => (
    <div data-testid="alert-trigger">{children}</div>
  ),
  AlertDialogContent: ({ children }: any) => (
    <div data-testid="alert-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => (
    <h4 data-testid="alert-title">{children}</h4>
  ),
  AlertDialogDescription: ({ children }: any) => (
    <div data-testid="alert-description">{children}</div>
  ),
  AlertDialogFooter: ({ children }: any) => (
    <div data-testid="alert-footer">{children}</div>
  ),
  AlertDialogCancel: ({ children }: any) => (
    <button data-testid="alert-cancel">{children}</button>
  ),
  AlertDialogAction: ({ children, onClick, disabled, ...props }: any) => (
    <button data-testid="alert-action" onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

// Mock cn utility
jest.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("SettingsContent", () => {
  beforeEach(() => {
    mockLogout.mockClear();
    mockToastError.mockClear();
    mockFetch.mockClear();
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000";
  });

  // === RENDERING ===
  describe("Rendering", () => {
    it("renders settings title and subtitle", () => {
      render(<SettingsContent />);

      expect(screen.getByText("Configuración")).toBeInTheDocument();
      expect(screen.getByText("Personaliza tu experiencia")).toBeInTheDocument();
    });

    it("renders all 4 cards", () => {
      render(<SettingsContent />);

      const cards = screen.getAllByTestId("card");
      expect(cards).toHaveLength(4);
    });

    it("renders Data & Privacy card with terms and privacy links", () => {
      render(<SettingsContent />);

      expect(screen.getByText("Datos y Privacidad")).toBeInTheDocument();
      expect(screen.getByText("Términos de Servicio")).toBeInTheDocument();
      expect(screen.getByText("Política de Privacidad")).toBeInTheDocument();
    });

    it("renders data encryption notice", () => {
      render(<SettingsContent />);

      expect(screen.getByText(/Tus datos están encriptados/)).toBeInTheDocument();
    });

    it("renders Language card", () => {
      render(<SettingsContent />);

      expect(screen.getByText("Idioma")).toBeInTheDocument();
      expect(
        screen.getAllByText("Selecciona tu idioma preferido").length
      ).toBeGreaterThanOrEqual(1);
    });

    it("renders About NEXO card with version and support info", () => {
      render(<SettingsContent />);

      expect(screen.getByText("Acerca de NEXO")).toBeInTheDocument();
      expect(screen.getByText("v2.0 Beta")).toBeInTheDocument();
      expect(screen.getByText("info@trynexo.ai")).toBeInTheDocument();
      expect(screen.getByText("VENKO AI INNOVATIONS LLC")).toBeInTheDocument();
    });

    it("renders Danger Zone card", () => {
      render(<SettingsContent />);

      expect(screen.getByText("Zona de Peligro")).toBeInTheDocument();
      expect(screen.getAllByText("Eliminar Cuenta").length).toBeGreaterThanOrEqual(1);
    });

    it("renders section icons", () => {
      render(<SettingsContent />);

      expect(screen.getByTestId("icon-shield")).toBeInTheDocument();
      expect(screen.getByTestId("icon-globe")).toBeInTheDocument();
      expect(screen.getByTestId("icon-info")).toBeInTheDocument();
      expect(screen.getByTestId("icon-trash")).toBeInTheDocument();
    });
  });

  // === LANGUAGE SELECT ===
  describe("Language Selection", () => {
    it("renders language selector with default value 'es'", () => {
      render(<SettingsContent />);

      const selectRoot = screen.getByTestId("select-root");
      expect(selectRoot).toHaveAttribute("data-value", "es");
    });

    it("renders Español and English options", () => {
      render(<SettingsContent />);

      expect(screen.getByTestId("select-item-es")).toHaveTextContent("Español");
      expect(screen.getByTestId("select-item-en")).toHaveTextContent("English");
    });

    it("changes language on selection", () => {
      render(<SettingsContent />);

      const selectRoot = screen.getByTestId("select-root");
      expect(selectRoot).toHaveAttribute("data-value", "es");

      fireEvent.click(screen.getByTestId("select-item-en"));

      expect(selectRoot).toHaveAttribute("data-value", "en");
    });
  });

  // === LINKS ===
  describe("Links", () => {
    it("renders terms of service link with correct href", () => {
      render(<SettingsContent />);

      const links = screen.getAllByRole("link", { name: /Ver/ });
      const termsLink = links.find(
        (link) => link.getAttribute("href") === "/terms"
      );
      expect(termsLink).toBeDefined();
    });

    it("renders privacy policy link with correct href", () => {
      render(<SettingsContent />);

      const links = screen.getAllByRole("link", { name: /Ver/ });
      const privacyLink = links.find(
        (link) => link.getAttribute("href") === "/privacy"
      );
      expect(privacyLink).toBeDefined();
    });

    it("renders support email link", () => {
      render(<SettingsContent />);

      const emailLink = screen.getByRole("link", { name: /info@trynexo.ai/ });
      expect(emailLink).toHaveAttribute("href", "mailto:info@trynexo.ai");
    });
  });

  // === DELETE ACCOUNT ===
  describe("Delete Account", () => {
    it("renders delete account confirmation dialog", () => {
      render(<SettingsContent />);

      const alertDialogs = screen.getAllByTestId("alert-dialog");
      expect(alertDialogs.length).toBe(2);
      expect(alertDialogs[1]).toBeInTheDocument();
      expect(screen.getAllByTestId("alert-title")[1]).toHaveTextContent(
        "¿Estás seguro?"
      );
    });

    it("shows deletion consequences list", () => {
      render(<SettingsContent />);

      expect(
        screen.getByText("Se eliminarán tus conversaciones")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Se eliminarán tus datos")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Se cancelará tu suscripción")
      ).toBeInTheDocument();
      expect(
        screen.getByText("No podrás recuperar tu cuenta")
      ).toBeInTheDocument();
    });

    it("shows cancel and confirm buttons in dialog", () => {
      render(<SettingsContent />);

      expect(screen.getAllByTestId("alert-cancel")[1]).toHaveTextContent("Cancelar");
      expect(screen.getAllByTestId("alert-action")[1]).toHaveTextContent(
        "Sí, eliminar cuenta"
      );
    });

    it("calls API and logout on successful deletion (204)", async () => {
      mockFetch.mockResolvedValueOnce({ status: 204 });

      render(<SettingsContent />);

      await act(async () => {
        fireEvent.click(screen.getAllByTestId("alert-action")[1]);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "http://localhost:8000/api/v1/auth/account",
          expect.objectContaining({
            method: "DELETE",
            credentials: "include",
          })
        );
      });

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });
    });

    it("handles expired session (401) - shows toast and logs out", async () => {
      mockFetch.mockResolvedValueOnce({ status: 401 });

      render(<SettingsContent />);

      await act(async () => {
        fireEvent.click(screen.getAllByTestId("alert-action")[1]);
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Tu sesión ha expirado. Por favor inicia sesión de nuevo."
        );
      });

      expect(mockLogout).toHaveBeenCalled();
    });

    it("handles server error - shows error toast", async () => {
      mockFetch.mockResolvedValueOnce({
        status: 500,
        json: () => Promise.resolve({ detail: "Server error" }),
      });

      render(<SettingsContent />);

      await act(async () => {
        fireEvent.click(screen.getAllByTestId("alert-action")[1]);
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("Server error");
      });

      expect(mockLogout).not.toHaveBeenCalled();
    });

    it("handles server error with no detail - shows fallback message", async () => {
      mockFetch.mockResolvedValueOnce({
        status: 500,
        json: () => Promise.reject(new Error("parse error")),
      });

      render(<SettingsContent />);

      await act(async () => {
        fireEvent.click(screen.getAllByTestId("alert-action")[1]);
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Error al eliminar cuenta. Por favor intenta de nuevo."
        );
      });

      expect(mockLogout).not.toHaveBeenCalled();
    });

    it("handles network error - shows connection error toast", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));

      render(<SettingsContent />);

      await act(async () => {
        fireEvent.click(screen.getAllByTestId("alert-action")[1]);
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Error de conexión. Por favor verifica tu internet e intenta de nuevo."
        );
      });

      expect(mockLogout).not.toHaveBeenCalled();
    });

    it("sets isDeleting back to false after completion", async () => {
      mockFetch.mockResolvedValueOnce({ status: 204 });

      render(<SettingsContent />);

      const actionButton = screen.getAllByTestId("alert-action")[1];

      await act(async () => {
        fireEvent.click(actionButton);
      });

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(actionButton).not.toBeDisabled();
      });
    });
  });

  // === EDGE CASES ===
  describe("Edge Cases", () => {
    it("terms and privacy links open in new tab", () => {
      render(<SettingsContent />);

      const termsLink = screen.getAllByRole("link", { name: /Ver/ }).find(
        (link) => link.getAttribute("href") === "/terms"
      );
      const privacyLink = screen.getAllByRole("link", { name: /Ver/ }).find(
        (link) => link.getAttribute("href") === "/privacy"
      );

      expect(termsLink).toHaveAttribute("target", "_blank");
      expect(termsLink).toHaveAttribute("rel", "noopener noreferrer");
      expect(privacyLink).toHaveAttribute("target", "_blank");
      expect(privacyLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("delete fetch includes credentials: include", async () => {
      mockFetch.mockResolvedValueOnce({ status: 204 });

      render(<SettingsContent />);

      await act(async () => {
        fireEvent.click(screen.getAllByTestId("alert-action")[1]);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "http://localhost:8000/api/v1/auth/account",
          expect.objectContaining({
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          })
        );
      });
    });
  });
});

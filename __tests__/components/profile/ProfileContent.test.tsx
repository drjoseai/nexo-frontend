/**
 * Tests for ProfileContent Component
 * NEXO v2.0
 *
 * @module __tests__/components/profile/ProfileContent.test
 */

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ProfileContent } from "@/components/profile/ProfileContent";
import { useAuthStore } from "@/lib/store/auth";
import type { User } from "@/types/auth";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    const translations: Record<string, Record<string, string>> = {
      profile: {
        title: "Mi Perfil",
        subtitle: "Gestiona tu información personal",
        personalInfo: "Información Personal",
        personalInfoDescription: "Tu información básica de cuenta",
        edit: "Editar",
        save: "Guardar",
        displayName: "Nombre",
        displayNamePlaceholder: "Tu nombre",
        email: "Email",
        notSet: "No configurado",
        notAvailable: "No disponible",
        subscription: "Suscripción",
        subscriptionDescription: "Tu plan actual",
        currentPlan: "Plan actual",
        trialEnds: "Trial termina:",
        nextRenewal: "Próxima renovación:",
        viewPlans: "Ver planes",
        accountInfo: "Información de Cuenta",
        accountInfoDescription: "Detalles de tu cuenta",
        accountCreated: "Cuenta creada",
        ageVerification: "Verificación de edad",
        verified18: "Verificado +18",
        notVerified: "No verificado",
        verifyAge: "Verificar edad",
        ageVerifiedSuccess: "Edad verificada exitosamente",
      },
      common: {
        cancel: "Cancelar",
      },
    };
    return (key: string) => translations[namespace]?.[key] || key;
  },
  useLocale: () => "es",
}));

// Mock auth store
const mockUser: User = {
  id: "user-1",
  email: "test@nexo.ai",
  display_name: "Test User",
  plan: "trial",
  age_verified: false,
  tos_accepted: true,
  date_of_birth: "1990-01-15",
  preferred_language: "es",
  created_at: "2025-12-01T10:00:00Z",
  trial_ends_at: "2025-12-11T10:00:00Z",
  subscription_ends_at: null,
  onboarding_completed: true,
};

let currentMockUser: User | null = mockUser;

jest.mock("@/lib/store/auth", () => ({
  useAuthStore: Object.assign(
    jest.fn(() => ({ user: currentMockUser })),
    { getState: jest.fn(() => ({ loadUser: jest.fn() })) }
  ),
}));

// Mock lucide-react
jest.mock("lucide-react", () => ({
  User: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-user" {...props} />,
  Mail: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-mail" {...props} />,
  Calendar: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-calendar" {...props} />,
  Shield: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-shield" {...props} />,
  Save: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-save" {...props} />,
  Loader2: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-loader" {...props} />,
}));

// Mock UI components
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string }) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label {...props}>{children}</label>
  ),
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

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span data-testid="badge" className={className} {...props}>{children}</span>
  ),
}));

// Mock AgeVerificationModal — capture props
let capturedAgeModalProps: { open: boolean; onOpenChange: (open: boolean) => void; onVerified: () => Promise<void> } | null = null;
jest.mock("@/components/chat/AgeVerificationModal", () => ({
  AgeVerificationModal: (props: { open: boolean; onOpenChange: (open: boolean) => void; onVerified: () => Promise<void> }) => {
    capturedAgeModalProps = props;
    return props.open ? <div data-testid="age-modal">Age Modal</div> : null;
  },
}));

// Mock sonner
const mockToastSuccess = jest.fn();
jest.mock("sonner", () => ({
  toast: { success: (...args: unknown[]) => mockToastSuccess(...args) },
}));

// Mock cn utility — pass through
jest.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

describe("ProfileContent", () => {
  beforeEach(() => {
    currentMockUser = { ...mockUser };
    capturedAgeModalProps = null;
    mockToastSuccess.mockClear();
    jest.useRealTimers();
  });

  // === RENDERING ===
  describe("Rendering", () => {
    it("shows loading spinner when user is null", () => {
      currentMockUser = null;
      render(<ProfileContent />);

      expect(screen.getByTestId("icon-loader")).toBeInTheDocument();
    });

    it("renders profile title and subtitle", () => {
      render(<ProfileContent />);

      expect(screen.getByText("Mi Perfil")).toBeInTheDocument();
      expect(screen.getByText("Gestiona tu información personal")).toBeInTheDocument();
    });

    it("renders user display name and email", () => {
      render(<ProfileContent />);

      const nameElements = screen.getAllByText("Test User");
      expect(nameElements.length).toBeGreaterThanOrEqual(1);
      const emailElements = screen.getAllByText("test@nexo.ai");
      expect(emailElements.length).toBeGreaterThanOrEqual(1);
    });

    it("renders email fallback when display_name is null", () => {
      currentMockUser = { ...mockUser, display_name: null };
      render(<ProfileContent />);

      expect(screen.getByText("test")).toBeInTheDocument();
    });

    it("renders all three cards (Personal, Subscription, Account)", () => {
      render(<ProfileContent />);

      const cards = screen.getAllByTestId("card");
      expect(cards).toHaveLength(3);
    });
  });

  // === EDIT MODE ===
  describe("Edit Mode", () => {
    it("shows Edit button in view mode", () => {
      render(<ProfileContent />);

      expect(screen.getByText("Editar")).toBeInTheDocument();
    });

    it("enters edit mode on Edit click, shows input and Cancel/Save", () => {
      render(<ProfileContent />);

      fireEvent.click(screen.getByText("Editar"));

      const input = screen.getByDisplayValue("Test User");
      expect(input).toBeInTheDocument();
      expect(screen.getByText("Cancelar")).toBeInTheDocument();
      expect(screen.getByText("Guardar")).toBeInTheDocument();
    });

    it("exits edit mode on Cancel click", () => {
      render(<ProfileContent />);

      fireEvent.click(screen.getByText("Editar"));
      expect(screen.getByText("Cancelar")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Cancelar"));

      expect(screen.getByText("Editar")).toBeInTheDocument();
      expect(screen.queryByDisplayValue("Test User")).not.toBeInTheDocument();
    });

    it("updates form input value", () => {
      render(<ProfileContent />);

      fireEvent.click(screen.getByText("Editar"));

      const input = screen.getByDisplayValue("Test User") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "New Name" } });

      expect(input.value).toBe("New Name");
    });

    it("save button triggers handleSave and exits edit mode", async () => {
      jest.useFakeTimers();

      render(<ProfileContent />);

      fireEvent.click(screen.getByText("Editar"));
      expect(screen.getByText("Guardar")).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(screen.getByText("Guardar"));
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText("Editar")).toBeInTheDocument();
      });
    });
  });

  // === SUBSCRIPTION CARD ===
  describe("Subscription", () => {
    it("shows current plan badge with TRIAL", () => {
      render(<ProfileContent />);

      const badge = screen.getByTestId("badge");
      expect(badge).toHaveTextContent("TRIAL");
    });

    it("shows trial end date for trial plan", () => {
      render(<ProfileContent />);

      expect(screen.getByText(/Trial termina:/)).toBeInTheDocument();
    });

    it("shows renewal date for plus plan", () => {
      currentMockUser = {
        ...mockUser,
        plan: "plus",
        trial_ends_at: null,
        subscription_ends_at: "2026-01-15T00:00:00Z",
      };
      render(<ProfileContent />);

      expect(screen.getByText(/Próxima renovación:/)).toBeInTheDocument();
    });

    it("shows renewal date for premium plan", () => {
      currentMockUser = {
        ...mockUser,
        plan: "premium",
        trial_ends_at: null,
        subscription_ends_at: "2026-02-15T00:00:00Z",
      };
      render(<ProfileContent />);

      expect(screen.getByText(/Próxima renovación:/)).toBeInTheDocument();
    });

    it("shows View Plans button", () => {
      render(<ProfileContent />);

      expect(screen.getByText("Ver planes")).toBeInTheDocument();
    });

    it("getPlanBadgeColor applies correct class for premium", () => {
      currentMockUser = { ...mockUser, plan: "premium" };
      render(<ProfileContent />);

      const badge = screen.getByTestId("badge");
      expect(badge.className).toContain("amber");
    });

    it("getPlanBadgeColor applies correct class for plus", () => {
      currentMockUser = { ...mockUser, plan: "plus" };
      render(<ProfileContent />);

      const badge = screen.getByTestId("badge");
      expect(badge.className).toContain("primary");
    });

    it("getPlanBadgeColor applies correct class for free", () => {
      currentMockUser = { ...mockUser, plan: "free" };
      render(<ProfileContent />);

      const badge = screen.getByTestId("badge");
      expect(badge.className).toContain("muted");
    });
  });

  // === ACCOUNT INFO CARD ===
  describe("Account Info", () => {
    it("shows account creation date", () => {
      render(<ProfileContent />);

      const formatted = new Date("2025-12-01T10:00:00Z").toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      expect(screen.getByText(formatted)).toBeInTheDocument();
    });

    it("shows 'Not verified' when age_verified is false", () => {
      render(<ProfileContent />);

      expect(screen.getByText("No verificado")).toBeInTheDocument();
    });

    it("shows 'Verified +18' when age_verified is true", () => {
      currentMockUser = { ...mockUser, age_verified: true };
      render(<ProfileContent />);

      expect(screen.getByText("Verificado +18")).toBeInTheDocument();
    });

    it("shows Verify Age button when not verified", () => {
      render(<ProfileContent />);

      expect(screen.getByText("Verificar edad")).toBeInTheDocument();
    });

    it("hides Verify Age button when already verified", () => {
      currentMockUser = { ...mockUser, age_verified: true };
      render(<ProfileContent />);

      expect(screen.queryByText("Verificar edad")).not.toBeInTheDocument();
    });

    it("opens age verification modal on Verify click", () => {
      render(<ProfileContent />);

      expect(screen.queryByTestId("age-modal")).not.toBeInTheDocument();

      fireEvent.click(screen.getByText("Verificar edad"));

      expect(screen.getByTestId("age-modal")).toBeInTheDocument();
    });
  });

  // === AGE VERIFICATION CALLBACK ===
  describe("Age Verification Callback", () => {
    it("calls loadUser and toast on verified callback", async () => {
      const mockLoadUser = jest.fn().mockResolvedValue(undefined);
      (useAuthStore as unknown as jest.Mock & { getState: jest.Mock }).getState.mockReturnValue({ loadUser: mockLoadUser });

      render(<ProfileContent />);

      fireEvent.click(screen.getByText("Verificar edad"));

      expect(capturedAgeModalProps).not.toBeNull();
      await act(async () => {
        await capturedAgeModalProps!.onVerified();
      });

      expect(mockLoadUser).toHaveBeenCalled();
      expect(mockToastSuccess).toHaveBeenCalledWith("Edad verificada exitosamente");
    });
  });

  // === EDGE CASES ===
  describe("Edge Cases", () => {
    it("formatDate returns 'No disponible' for undefined date", () => {
      currentMockUser = { ...mockUser, created_at: undefined as unknown as string };
      render(<ProfileContent />);

      expect(screen.getByText("No disponible")).toBeInTheDocument();
    });

    it("handles user with no trial_ends_at for trial plan", () => {
      currentMockUser = { ...mockUser, plan: "trial", trial_ends_at: null };
      render(<ProfileContent />);

      expect(screen.queryByText(/Trial termina:/)).not.toBeInTheDocument();
    });
  });
});

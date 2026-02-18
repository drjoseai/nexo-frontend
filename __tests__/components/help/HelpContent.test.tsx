/**
 * Tests for HelpContent Component
 * NEXO v2.0
 *
 * @module __tests__/components/help/HelpContent.test
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import HelpContent from "@/components/help/HelpContent";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => {
    return (key: string) => {
      if (key === "title") return "Centro de Ayuda";
      if (key === "subtitle") return "Preguntas frecuentes";
      if (key === "contactCta.title") return "¿Necesitas más ayuda?";
      if (key === "contactCta.subtitle") return "Contáctanos";
      if (key === "contactCta.button") return "Enviar email";

      if (key.startsWith("sections.")) {
        const parts = key.split(".");
        if (parts[2] === "title") return `Section: ${parts[1]}`;
        if (parts[2]?.startsWith("q")) return `Question: ${parts[1]}.${parts[2]}`;
        if (parts[2]?.startsWith("a")) return `Answer: ${parts[1]}.${parts[2]}`;
      }
      return key;
    };
  },
}));

// Mock lucide-react
jest.mock("lucide-react", () => ({
  ChevronDown: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-chevron-down" {...props} />
  ),
  ChevronUp: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-chevron-up" {...props} />
  ),
  HelpCircle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-help" {...props} />
  ),
  MessageCircle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-message" {...props} />
  ),
  Users: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-users" {...props} />
  ),
  CreditCard: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-credit" {...props} />
  ),
  Shield: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-shield" {...props} />
  ),
  Mail: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-mail" {...props} />
  ),
}));

describe("HelpContent", () => {
  // === RENDERING ===
  describe("Rendering", () => {
    it("renders page title and subtitle", () => {
      render(<HelpContent />);

      expect(screen.getByText("Centro de Ayuda")).toBeInTheDocument();
      expect(screen.getByText("Preguntas frecuentes")).toBeInTheDocument();
    });

    it("renders all 6 FAQ sections", () => {
      render(<HelpContent />);

      expect(screen.getByText("Section: whatIsNexo")).toBeInTheDocument();
      expect(screen.getByText("Section: howItWorks")).toBeInTheDocument();
      expect(screen.getByText("Section: avatars")).toBeInTheDocument();
      expect(screen.getByText("Section: plans")).toBeInTheDocument();
      expect(screen.getByText("Section: privacy")).toBeInTheDocument();
      expect(screen.getByText("Section: contact")).toBeInTheDocument();
    });

    it("renders section icons", () => {
      render(<HelpContent />);

      expect(screen.getByTestId("icon-help")).toBeInTheDocument();
      expect(screen.getByTestId("icon-message")).toBeInTheDocument();
      expect(screen.getByTestId("icon-users")).toBeInTheDocument();
      expect(screen.getByTestId("icon-credit")).toBeInTheDocument();
      expect(screen.getByTestId("icon-shield")).toBeInTheDocument();
    });

    it("renders all FAQ questions (19 total)", () => {
      render(<HelpContent />);

      const questions = screen.getAllByText(/^Question:/);
      expect(questions).toHaveLength(19);
    });

    it("does not show any answers by default", () => {
      render(<HelpContent />);

      const answers = screen.queryAllByText(/^Answer:/);
      expect(answers).toHaveLength(0);
    });

    it("renders contact CTA section", () => {
      render(<HelpContent />);

      expect(screen.getByText("¿Necesitas más ayuda?")).toBeInTheDocument();
      expect(screen.getByText("Enviar email")).toBeInTheDocument();
    });

    it("renders mailto link in contact CTA", () => {
      render(<HelpContent />);

      const mailtoLink = screen.getByRole("link", { name: /enviar email/i });
      expect(mailtoLink).toHaveAttribute("href", "mailto:support@trynexo.ai");
    });
  });

  // === TOGGLE BEHAVIOR ===
  describe("Toggle Behavior", () => {
    it("opens FAQ item on click, shows answer", () => {
      render(<HelpContent />);

      const question = screen.getByText("Question: whatIsNexo.q1");
      fireEvent.click(question);

      expect(screen.getByText("Answer: whatIsNexo.a1")).toBeInTheDocument();
    });

    it("shows ChevronUp when item is open", () => {
      render(<HelpContent />);

      const question = screen.getByText("Question: whatIsNexo.q1");
      fireEvent.click(question);

      expect(screen.getByTestId("icon-chevron-up")).toBeInTheDocument();
    });

    it("closes FAQ item on second click", () => {
      render(<HelpContent />);

      const question = screen.getByText("Question: whatIsNexo.q1");
      fireEvent.click(question);
      expect(screen.getByText("Answer: whatIsNexo.a1")).toBeInTheDocument();

      fireEvent.click(question);
      expect(screen.queryByText("Answer: whatIsNexo.a1")).not.toBeInTheDocument();
    });

    it("can open multiple items simultaneously", () => {
      render(<HelpContent />);

      fireEvent.click(screen.getByText("Question: whatIsNexo.q1"));
      fireEvent.click(screen.getByText("Question: howItWorks.q1"));

      expect(screen.getByText("Answer: whatIsNexo.a1")).toBeInTheDocument();
      expect(screen.getByText("Answer: howItWorks.a1")).toBeInTheDocument();
    });

    it("can open multiple items within same section", () => {
      render(<HelpContent />);

      fireEvent.click(screen.getByText("Question: whatIsNexo.q1"));
      fireEvent.click(screen.getByText("Question: whatIsNexo.q2"));

      expect(screen.getByText("Answer: whatIsNexo.a1")).toBeInTheDocument();
      expect(screen.getByText("Answer: whatIsNexo.a2")).toBeInTheDocument();
    });

    it("closing one item doesn't affect other open items", () => {
      render(<HelpContent />);

      fireEvent.click(screen.getByText("Question: whatIsNexo.q1"));
      fireEvent.click(screen.getByText("Question: howItWorks.q1"));

      expect(screen.getByText("Answer: whatIsNexo.a1")).toBeInTheDocument();
      expect(screen.getByText("Answer: howItWorks.a1")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Question: whatIsNexo.q1"));

      expect(screen.queryByText("Answer: whatIsNexo.a1")).not.toBeInTheDocument();
      expect(screen.getByText("Answer: howItWorks.a1")).toBeInTheDocument();
    });
  });

  // === SECTION CONTENT ===
  describe("Section Content", () => {
    it("whatIsNexo section has 3 questions", () => {
      render(<HelpContent />);

      const questions = screen.getAllByText(/^Question: whatIsNexo\./);
      expect(questions).toHaveLength(3);
    });

    it("avatars section has 4 questions", () => {
      render(<HelpContent />);

      const questions = screen.getAllByText(/^Question: avatars\./);
      expect(questions).toHaveLength(4);
    });

    it("plans section has 4 questions", () => {
      render(<HelpContent />);

      const questions = screen.getAllByText(/^Question: plans\./);
      expect(questions).toHaveLength(4);
    });

    it("contact section has 2 questions", () => {
      render(<HelpContent />);

      const questions = screen.getAllByText(/^Question: contact\./);
      expect(questions).toHaveLength(2);
    });
  });

  // === EDGE CASES ===
  describe("Edge Cases", () => {
    it("renders correct number of section containers", () => {
      const { container } = render(<HelpContent />);

      const sectionCards = container.querySelectorAll(".bg-card");
      expect(sectionCards).toHaveLength(6);
    });

    it("each FAQ item button is a button element", () => {
      render(<HelpContent />);

      const question = screen.getByText("Question: whatIsNexo.q1");
      expect(question.closest("button")).toBeInTheDocument();
    });

    it("all question buttons are interactive", () => {
      render(<HelpContent />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(19);
    });
  });
});

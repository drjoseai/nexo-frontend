/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteHistoryButton } from "@/components/chat/DeleteHistoryButton";

jest.mock("lucide-react", () => ({
  Trash2: (props: any) => <span data-testid="trash-icon" {...props} />,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: any) => (
    <div data-testid="alert-dialog">{children}</div>
  ),
  AlertDialogTrigger: ({ children, asChild }: any) => (
    <div data-testid="alert-trigger">
      {asChild ? children : <button>{children}</button>}
    </div>
  ),
  AlertDialogContent: ({ children }: any) => (
    <div data-testid="alert-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <h2>{children}</h2>,
  AlertDialogDescription: ({ children }: any) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogCancel: ({ children, ...props }: any) => (
    <button data-testid="cancel-btn" {...props}>
      {children}
    </button>
  ),
  AlertDialogAction: ({ children, onClick, ...props }: any) => (
    <button
      data-testid="confirm-btn"
      onClick={() => {
        onClick?.()?.catch?.(() => {});
      }}
      {...props}
    >
      {children}
    </button>
  ),
}));

describe("DeleteHistoryButton", () => {
  const defaultProps = {
    avatarName: "TestBot",
    onDelete: jest.fn().mockResolvedValue(undefined),
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    defaultProps.onDelete = jest.fn().mockResolvedValue(undefined);
  });

  it('renders button with Trash icon and sr-only "Borrar historial"', () => {
    render(<DeleteHistoryButton {...defaultProps} />);
    expect(screen.getByTestId("trash-icon")).toBeInTheDocument();
    expect(screen.getByText("Borrar historial", { selector: ".sr-only" })).toBeInTheDocument();
  });

  it('button has title "Borrar historial"', () => {
    render(<DeleteHistoryButton {...defaultProps} />);
    const buttons = screen.getAllByRole("button");
    const triggerBtn = buttons.find((b) => b.getAttribute("title") === "Borrar historial");
    expect(triggerBtn).toBeDefined();
  });

  it("button is disabled when disabled prop is true", () => {
    render(<DeleteHistoryButton {...defaultProps} disabled={true} />);
    const buttons = screen.getAllByRole("button");
    const triggerBtn = buttons.find((b) => b.getAttribute("title") === "Borrar historial");
    expect(triggerBtn).toBeDisabled();
  });

  it("shows confirmation dialog title", () => {
    render(<DeleteHistoryButton {...defaultProps} />);
    expect(screen.getByText("¿Borrar historial de chat?")).toBeInTheDocument();
  });

  it("shows description with avatarName", () => {
    render(<DeleteHistoryButton {...defaultProps} />);
    expect(
      screen.getByText(/Se eliminarán todos los mensajes con TestBot/)
    ).toBeInTheDocument();
  });

  it("shows cancel button", () => {
    render(<DeleteHistoryButton {...defaultProps} />);
    expect(screen.getByTestId("cancel-btn")).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("calls onDelete when confirm is clicked", async () => {
    const user = userEvent.setup();
    render(<DeleteHistoryButton {...defaultProps} />);

    await user.click(screen.getByTestId("confirm-btn"));
    expect(defaultProps.onDelete).toHaveBeenCalled();
  });

  it('shows "Borrando..." during delete', async () => {
    let resolveDelete: () => void;
    const pendingDelete = new Promise<void>((resolve) => {
      resolveDelete = resolve;
    });
    const onDelete = jest.fn(() => pendingDelete);

    render(
      <DeleteHistoryButton
        avatarName="TestBot"
        onDelete={onDelete}
        disabled={false}
      />
    );

    await act(async () => {
      screen.getByTestId("confirm-btn").click();
    });

    expect(screen.getByText("Borrando...")).toBeInTheDocument();

    await act(async () => {
      resolveDelete!();
    });
  });

  it("resets isDeleting after successful delete", async () => {
    render(<DeleteHistoryButton {...defaultProps} />);

    await act(async () => {
      screen.getByTestId("confirm-btn").click();
    });

    await waitFor(() => {
      expect(screen.getByText("Borrar historial", { selector: "button[data-testid='confirm-btn']" })).toBeInTheDocument();
    });
  });

  it("resets isDeleting even if onDelete fails", async () => {
    const failingDelete = jest.fn().mockRejectedValue(new Error("fail"));

    render(
      <DeleteHistoryButton
        avatarName="TestBot"
        onDelete={failingDelete}
        disabled={false}
      />
    );

    await act(async () => {
      screen.getByTestId("confirm-btn").click();
    });

    await waitFor(() => {
      expect(screen.getByText("Borrar historial", { selector: "button[data-testid='confirm-btn']" })).toBeInTheDocument();
    });
  });
});

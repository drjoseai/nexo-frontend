import { render, screen, fireEvent } from "@testing-library/react";
import { Switch } from "@/components/ui/switch";

jest.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

jest.mock("@radix-ui/react-switch", () => {
  const React = require("react");
  const Root = React.forwardRef(
    (
      { className, children, checked, defaultChecked, onCheckedChange, disabled, ...props }: {
        className?: string;
        children?: React.ReactNode;
        checked?: boolean;
        defaultChecked?: boolean;
        onCheckedChange?: (checked: boolean) => void;
        disabled?: boolean;
        [key: string]: unknown;
      },
      ref: React.Ref<HTMLButtonElement>
    ) => {
      const [isChecked, setIsChecked] = React.useState(defaultChecked ?? checked ?? false);
      React.useEffect(() => {
        if (checked !== undefined) setIsChecked(checked);
      }, [checked]);
      return (
        <button
          ref={ref}
          role="switch"
          aria-checked={isChecked}
          data-state={isChecked ? "checked" : "unchecked"}
          className={className}
          disabled={disabled}
          onClick={() => {
            const next = !isChecked;
            setIsChecked(next);
            onCheckedChange?.(next);
          }}
          {...props}
        >
          {children}
        </button>
      );
    }
  );
  Root.displayName = "SwitchRoot";

  const Thumb = React.forwardRef(
    ({ className, ...props }: { className?: string; [key: string]: unknown }, ref: React.Ref<HTMLSpanElement>) => (
      <span ref={ref} className={className} data-slot="switch-thumb" {...props} />
    )
  );
  Thumb.displayName = "SwitchThumb";

  return { Root, Thumb };
});

describe("Switch", () => {
  it("renders as a switch role element", () => {
    render(<Switch />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("starts unchecked by default", () => {
    render(<Switch />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("toggles on click", () => {
    const onChange = jest.fn();
    render(<Switch onCheckedChange={onChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("renders thumb element", () => {
    const { container } = render(<Switch />);
    expect(container.querySelector("[data-slot='switch-thumb']")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Switch className="custom-class" />);
    expect(screen.getByRole("switch").className).toContain("custom-class");
  });

  it("supports disabled state", () => {
    render(<Switch disabled />);
    expect(screen.getByRole("switch")).toBeDisabled();
  });
});

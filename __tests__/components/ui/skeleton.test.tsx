import { render } from "@testing-library/react";
import { Skeleton } from "@/components/ui/skeleton";

jest.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

describe("Skeleton", () => {
  it("renders a div with skeleton classes", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe("DIV");
    expect(el.getAttribute("data-slot")).toBe("skeleton");
    expect(el.className).toContain("animate-pulse");
  });

  it("accepts and merges custom className", () => {
    const { container } = render(<Skeleton className="h-4 w-full" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("h-4 w-full");
    expect(el.className).toContain("animate-pulse");
  });

  it("passes additional props to the div", () => {
    const { container } = render(<Skeleton data-testid="my-skeleton" />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("data-testid")).toBe("my-skeleton");
  });
});

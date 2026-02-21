import { render, screen, fireEvent } from "@testing-library/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

jest.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

jest.mock("@radix-ui/react-tabs", () => {
  const React = jest.requireActual("react");

  const Root = React.forwardRef(
    (
      { className, defaultValue, value, onValueChange, children, ...props }: {
        className?: string;
        defaultValue?: string;
        value?: string;
        onValueChange?: (v: string) => void;
        children?: React.ReactNode;
        [key: string]: unknown;
      },
      ref: React.Ref<HTMLDivElement>
    ) => {
      const [active, setActive] = React.useState(value ?? defaultValue ?? "");
      React.useEffect(() => {
        if (value !== undefined) setActive(value);
      }, [value]);
      const ctx = { active, setActive: (v: string) => { setActive(v); onValueChange?.(v); } };
      return (
        <div ref={ref} className={className} data-slot="tabs" {...props}>
          <TabsContext.Provider value={ctx}>{children}</TabsContext.Provider>
        </div>
      );
    }
  );
  Root.displayName = "TabsRoot";

  const TabsContext = React.createContext<{ active: string; setActive: (v: string) => void }>({ active: "", setActive: () => {} });

  const List = React.forwardRef(
    ({ className, children, ...props }: { className?: string; children?: React.ReactNode; [key: string]: unknown }, ref: React.Ref<HTMLDivElement>) => (
      <div ref={ref} role="tablist" className={className} data-slot="tabs-list" {...props}>{children}</div>
    )
  );
  List.displayName = "TabsList";

  const Trigger = React.forwardRef(
    ({ className, value, children, ...props }: { className?: string; value: string; children?: React.ReactNode; [key: string]: unknown }, ref: React.Ref<HTMLButtonElement>) => {
      const ctx = React.useContext(TabsContext);
      return (
        <button
          ref={ref}
          role="tab"
          aria-selected={ctx.active === value}
          data-state={ctx.active === value ? "active" : "inactive"}
          data-slot="tabs-trigger"
          className={className}
          onClick={() => ctx.setActive(value)}
          {...props}
        >
          {children}
        </button>
      );
    }
  );
  Trigger.displayName = "TabsTrigger";

  const Content = React.forwardRef(
    ({ className, value, children, ...props }: { className?: string; value: string; children?: React.ReactNode; [key: string]: unknown }, ref: React.Ref<HTMLDivElement>) => {
      const ctx = React.useContext(TabsContext);
      if (ctx.active !== value) return null;
      return (
        <div ref={ref} role="tabpanel" className={className} data-slot="tabs-content" {...props}>{children}</div>
      );
    }
  );
  Content.displayName = "TabsContent";

  return { Root, List, Trigger, Content };
});

describe("Tabs", () => {
  it("renders tabs with list and triggers", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.getByText("Content 1")).toBeInTheDocument();
  });

  it("shows correct content for default tab", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    expect(screen.getByText("Content 1")).toBeInTheDocument();
    expect(screen.queryByText("Content 2")).not.toBeInTheDocument();
  });

  it("switches content on tab click", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    fireEvent.click(screen.getByText("Tab 2"));
    expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
    expect(screen.getByText("Content 2")).toBeInTheDocument();
  });

  it("marks active tab with active state", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    );
    const tab1 = screen.getByText("Tab 1");
    expect(tab1).toHaveAttribute("aria-selected", "true");
    expect(tab1).toHaveAttribute("data-state", "active");
  });

  it("applies custom className to each component", () => {
    const { container } = render(
      <Tabs defaultValue="a" className="tabs-root">
        <TabsList className="tabs-list">
          <TabsTrigger value="a" className="tabs-trigger">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a" className="tabs-content">Aaa</TabsContent>
      </Tabs>
    );
    expect(container.querySelector(".tabs-root")).toBeInTheDocument();
    expect(container.querySelector(".tabs-list")).toBeInTheDocument();
    expect(container.querySelector(".tabs-trigger")).toBeInTheDocument();
    expect(container.querySelector(".tabs-content")).toBeInTheDocument();
  });
});

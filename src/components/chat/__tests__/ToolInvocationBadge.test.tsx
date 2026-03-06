import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
import { ToolInvocationBadge } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

function makeInvocation(
  toolName: string,
  args: Record<string, unknown>,
  state: ToolInvocation["state"] = "call",
  result?: unknown
): ToolInvocation {
  if (state === "result") {
    return { toolCallId: "1", toolName, args, state, result } as ToolInvocation;
  }
  return { toolCallId: "1", toolName, args, state } as ToolInvocation;
}

describe("ToolInvocationBadge – str_replace_editor", () => {
  it("create command", () => {
    render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/src/App.jsx" })} />);
    expect(screen.getByText("Creating App.jsx")).toBeDefined();
  });

  it("str_replace command", () => {
    render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "str_replace", path: "/src/App.jsx" })} />);
    expect(screen.getByText("Editing App.jsx")).toBeDefined();
  });

  it("insert command", () => {
    render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "insert", path: "/src/App.jsx" })} />);
    expect(screen.getByText("Editing App.jsx")).toBeDefined();
  });

  it("undo_edit command", () => {
    render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "undo_edit", path: "/src/App.jsx" })} />);
    expect(screen.getByText("Undoing edit in App.jsx")).toBeDefined();
  });

  it("view command", () => {
    render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "view", path: "/src/App.jsx" })} />);
    expect(screen.getByText("Viewing App.jsx")).toBeDefined();
  });

  it("unknown command", () => {
    render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "unknown", path: "/src/App.jsx" })} />);
    expect(screen.getByText("Working on App.jsx")).toBeDefined();
  });

  it("extracts filename from nested path", () => {
    render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/src/components/App.jsx" })} />);
    expect(screen.getByText("Creating App.jsx")).toBeDefined();
  });
});

describe("ToolInvocationBadge – file_manager", () => {
  it("rename command", () => {
    render(<ToolInvocationBadge toolInvocation={makeInvocation("file_manager", { command: "rename", path: "/src/old.jsx", new_path: "/src/new.jsx" })} />);
    expect(screen.getByText("Renaming old.jsx to new.jsx")).toBeDefined();
  });

  it("delete command", () => {
    render(<ToolInvocationBadge toolInvocation={makeInvocation("file_manager", { command: "delete", path: "/src/App.jsx" })} />);
    expect(screen.getByText("Deleting App.jsx")).toBeDefined();
  });

  it("unknown command", () => {
    render(<ToolInvocationBadge toolInvocation={makeInvocation("file_manager", { command: "unknown", path: "/src/App.jsx" })} />);
    expect(screen.getByText("Managing App.jsx")).toBeDefined();
  });
});

describe("ToolInvocationBadge – unknown tool", () => {
  it("falls back to tool name", () => {
    render(<ToolInvocationBadge toolInvocation={makeInvocation("some_other_tool", { command: "do_thing", path: "/src/App.jsx" })} />);
    expect(screen.getByText("some_other_tool")).toBeDefined();
  });
});

describe("ToolInvocationBadge – states", () => {
  it("state: call renders spinner", () => {
    const { container } = render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/src/App.jsx" }, "call")} />);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  it("state: partial-call renders spinner", () => {
    const { container } = render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/src/App.jsx" }, "partial-call")} />);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  it("state: result with truthy result renders green dot", () => {
    const { container } = render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/src/App.jsx" }, "result", "ok")} />);
    expect(container.querySelector(".animate-spin")).toBeNull();
    expect(container.querySelector(".bg-emerald-500")).toBeTruthy();
  });

  it("state: result with falsy result renders spinner", () => {
    const { container } = render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/src/App.jsx" }, "result", null)} />);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });
});

describe("ToolInvocationBadge – edge cases", () => {
  it("missing args does not crash", () => {
    const invocation = { toolCallId: "1", toolName: "str_replace_editor", state: "call" } as unknown as ToolInvocation;
    expect(() => render(<ToolInvocationBadge toolInvocation={invocation} />)).not.toThrow();
  });
});

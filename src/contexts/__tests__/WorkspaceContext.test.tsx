import { act, renderHook } from "@testing-library/react";
import { WorkspaceProvider, useWorkspace } from "../WorkspaceContext";
import {
  createWorkspace,
  WORKSPACE_KEY,
  parseWorkspace,
} from "../../data/workspace";

describe("workspace persistence and recovery", () => {
  beforeEach(() => localStorage.clear());
  it("persists edits across a fresh provider mount", () => {
    const first = renderHook(() => useWorkspace(), {
      wrapper: WorkspaceProvider,
    });
    act(() =>
      first.result.current.setCompanies((prev) =>
        prev.map((c) =>
          c.id === "1" ? { ...c, name: "Persistent company" } : c,
        ),
      ),
    );
    first.unmount();
    const next = renderHook(() => useWorkspace(), {
      wrapper: WorkspaceProvider,
    });
    expect(next.result.current.data.companies[0].name).toBe(
      "Persistent company",
    );
    expect(
      JSON.parse(localStorage.getItem(WORKSPACE_KEY)!).companies[0].name,
    ).toBe("Persistent company");
  });
  it("does not replace working data when a backup import is invalid", () => {
    const { result } = renderHook(() => useWorkspace(), {
      wrapper: WorkspaceProvider,
    });
    act(() => {
      expect(result.current.restoreBackup("{bad")).toBe(false);
    });
    expect(result.current.data.companies).toHaveLength(3);
    expect(result.current.error).toMatch(/backup/i);
  });
  it("exports a large accepted workspace that its own importer accepts", () => {
    const initial = createWorkspace();
    initial.tasks = Array.from({ length: 490 }, (_, i) => ({
      ...initial.tasks[0],
      id: `bulk-${i}`,
      description: "x".repeat(10000),
    }));
    const { result } = renderHook(() => useWorkspace(), {
      wrapper: WorkspaceProvider,
    });
    const setter = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceeded");
      });
    try {
      act(() => {
        expect(result.current.setTasks(initial.tasks)).toBe(true);
      });
      expect(() => parseWorkspace(result.current.exportBackup())).not.toThrow();
      expect(result.current.data.tasks).toHaveLength(490);
    } finally {
      setter.mockRestore();
    }
  });
  it("warns but retains edits when saving runs out of quota and exports still round-trip", () => {
    const { result } = renderHook(() => useWorkspace(), {
      wrapper: WorkspaceProvider,
    });
    const setter = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceeded");
      });
    try {
      act(() =>
        result.current.setTasks((tasks) =>
          tasks.map((t, i) =>
            i === 0 ? { ...t, title: "Session-only task" } : t,
          ),
        ),
      );
      expect(result.current.error).toMatch(/could not be saved/);
      expect(JSON.parse(result.current.exportBackup()).tasks[0].title).toBe(
        "Session-only task",
      );
    } finally {
      setter.mockRestore();
    }
  });
  it("preserves unreadable storage until explicit recovery", () => {
    localStorage.setItem(WORKSPACE_KEY, "{damaged");
    const { result } = renderHook(() => useWorkspace(), {
      wrapper: WorkspaceProvider,
    });
    expect(result.current.recoveryRaw).toBe("{damaged");
    expect(localStorage.getItem(WORKSPACE_KEY)).toBe("{damaged");
    act(() => result.current.recoverStorage());
    expect(result.current.recoveryRaw).toBeNull();
    expect(localStorage.getItem(`${WORKSPACE_KEY}-recovery`)).toBe("{damaged");
  });
  it("restores valid empty backups and exports a new round-trip snapshot", () => {
    const { result } = renderHook(() => useWorkspace(), {
      wrapper: WorkspaceProvider,
    });
    const empty = {
      ...createWorkspace(),
      companies: [],
      contacts: [],
      tasks: [],
      deals: [],
      activities: [],
    };
    act(() => {
      expect(result.current.restoreBackup(JSON.stringify(empty))).toBe(true);
    });
    expect(result.current.retainedBackups.previous).not.toBeNull();
    expect(
      JSON.parse(result.current.retainedBackups.previous!).companies,
    ).toHaveLength(3);
    expect(result.current.data.companies).toHaveLength(0);
    expect(JSON.parse(result.current.exportBackup())).toEqual(empty);
  });
});

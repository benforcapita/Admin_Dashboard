import React, { createContext, useContext, useRef, useState } from "react";
import {
  createWorkspace,
  parseWorkspace,
  updateCollection,
  WORKSPACE_KEY,
} from "../data/workspace";
import type { Workspace } from "../data/workspace";
type Collection = "companies" | "contacts" | "tasks";
type Setter<K extends Collection> = (
  update: React.SetStateAction<Workspace[K]>,
) => boolean;
interface Context {
  data: Workspace;
  setCompanies: Setter<"companies">;
  setContacts: Setter<"contacts">;
  setTasks: Setter<"tasks">;
  error: string;
  recoveryRaw: string | null;
  retainedBackups: { previous: string | null; damaged: string | null };
  recoverStorage: () => void;
  restoreBackup: (raw: string) => boolean;
  exportBackup: () => string;
  clearError: () => void;
}
const WorkspaceContext = createContext<Context | undefined>(undefined);
function readCopy(suffix: string) {
  try {
    return localStorage.getItem(`${WORKSPACE_KEY}-${suffix}`);
  } catch {
    return null;
  }
}
function load() {
  try {
    const raw = localStorage.getItem(WORKSPACE_KEY);
    if (!raw) return { data: createWorkspace(), error: "", recoveryRaw: null };
    try {
      return { data: parseWorkspace(raw), error: "", recoveryRaw: null };
    } catch {
      return {
        data: createWorkspace(),
        error:
          "Saved data is unreadable. It has been preserved. Download it before starting a recovered workspace.",
        recoveryRaw: raw,
      };
    }
  } catch {
    return {
      data: createWorkspace(),
      error:
        "Browser storage is unavailable. Changes last only for this session; export a backup before closing.",
      recoveryRaw: null,
    };
  }
}
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [initial] = useState(load);
  const [data, setData] = useState(initial.data);
  const current = useRef(data);
  const [error, setError] = useState(initial.error);
  const [retainedBackups, setRetainedBackups] = useState(() => ({
    previous: readCopy("before-import"),
    damaged: readCopy("recovery"),
  }));
  const [recoveryRaw, setRecoveryRaw] = useState<string | null>(
    initial.recoveryRaw,
  );
  const commit = (next: Workspace) => {
    if (recoveryRaw !== null) {
      setError(
        "Recover or download the damaged saved data before editing this workspace.",
      );
      return false;
    }
    current.current = next;
    setData(next);
    try {
      localStorage.setItem(WORKSPACE_KEY, JSON.stringify(next));
      setError("");
    } catch {
      setError(
        "Changes could not be saved to browser storage. Export a backup before closing this tab.",
      );
    }
    return true;
  };
  const update = <K extends Collection>(
    key: K,
    value: React.SetStateAction<Workspace[K]>,
  ) => {
    try {
      const next =
        typeof value === "function" ? value(current.current[key]) : value;
      return commit(updateCollection(current.current, key, next));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "This change could not be applied.",
      );
      return false;
    }
  };
  const restoreBackup = (raw: string) => {
    try {
      const next = parseWorkspace(raw);
      // Keep the existing workspace recoverable before a user-confirmed restore.
      const previous = recoveryRaw ?? JSON.stringify(current.current);
      localStorage.setItem(`${WORKSPACE_KEY}-before-import`, previous);
      setRetainedBackups((copies) => ({ ...copies, previous }));
      localStorage.setItem(WORKSPACE_KEY, JSON.stringify(next));
      current.current = next;
      setData(next);
      setRecoveryRaw(null);
      setError("");
      return true;
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Backup import failed.",
      );
      return false;
    }
  };
  const recoverStorage = () => {
    if (recoveryRaw === null) return;
    try {
      localStorage.setItem(`${WORKSPACE_KEY}-recovery`, recoveryRaw);
      setRetainedBackups((copies) => ({ ...copies, damaged: recoveryRaw }));
      localStorage.setItem(WORKSPACE_KEY, JSON.stringify(current.current));
      setRecoveryRaw(null);
      setError("");
    } catch {
      setError(
        "Recovery could not be saved. Download the damaged data first and free browser storage.",
      );
    }
  };
  return (
    <WorkspaceContext.Provider
      value={{
        data,
        error,
        recoveryRaw,
        retainedBackups,
        recoverStorage,
        restoreBackup,
        exportBackup: () => JSON.stringify(current.current),
        clearError: () => setError(""),
        setCompanies: (value) => update("companies", value),
        setContacts: (value) => update("contacts", value),
        setTasks: (value) => update("tasks", value),
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
export function useWorkspace(): Context {
  const context = useContext(WorkspaceContext);
  if (!context)
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  return context;
}

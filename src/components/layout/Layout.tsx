import { Link } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useWorkspace } from "../../contexts/WorkspaceContext";
export function Layout({ children }: { children: React.ReactNode }) {
  const { error, recoveryRaw, clearError } = useWorkspace();
  return (
    <div className="flex flex-col md:flex-row min-h-screen md:h-screen bg-gray-50">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3"
        href="#main-content"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col md:overflow-hidden">
        <Header />
        {error && (
          <div
            role="alert"
            className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-sm text-amber-900 flex flex-wrap items-center gap-3"
          >
            <span className="flex-1">{error}</span>
            <Link to="/settings" className="font-semibold underline">
              Backup and recovery
            </Link>
            {recoveryRaw === null && (
              <button
                onClick={clearError}
                aria-label="Dismiss workspace notice"
              >
                Dismiss
              </button>
            )}
          </div>
        )}
        <main
          id="main-content"
          className="flex-1 min-w-0 md:overflow-y-auto p-4 md:p-6"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

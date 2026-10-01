import { useState } from "react";
import { Bell, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import { Avatar } from "../ui/Avatar";
import { Modal } from "../ui/Modal";
import { formatDate } from "../../utils/helpers";
export function Header() {
  const { user } = useAuth();
  const { data } = useWorkspace();
  const [query, setQuery] = useState("");
  const [activityOpen, setActivityOpen] = useState(false);
  const location = useLocation();
  const q = query.trim().toLowerCase();
  const matches = q
    ? [
        ...data.companies.map((c) => ({
          id: `company-${c.id}`,
          name: c.name,
          detail: "Company",
          path: "/companies",
          haystack: `${c.name} ${c.industry} ${c.country}`,
        })),
        ...data.contacts.map((c) => ({
          id: `contact-${c.id}`,
          name: c.name,
          detail: "Contact",
          path: "/contacts",
          haystack: `${c.name} ${c.email} ${c.jobTitle}`,
        })),
        ...data.tasks.map((t) => ({
          id: `task-${t.id}`,
          name: t.title,
          detail: "Task",
          path: "/tasks",
          haystack: `${t.title} ${t.description}`,
        })),
      ]
        .filter((r) => r.haystack.toLowerCase().includes(q))
        .slice(0, 8)
    : [];
  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-3 text-gray-400"
            size={16}
          />
          <input
            type="search"
            aria-label="Search workspace"
            placeholder="Search companies, contacts, tasks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("");
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {q && (
            <div
              className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 shadow-lg rounded-lg z-30 max-h-80 overflow-y-auto"
              aria-label="Search results"
            >
              {matches.map((result) => (
                <Link
                  key={result.id}
                  to={`${result.path}?q=${encodeURIComponent(result.name)}`}
                  onClick={() => setQuery("")}
                  className="block px-4 py-3 hover:bg-blue-50 focus:bg-blue-50"
                >
                  <span className="block text-sm font-medium break-words">
                    {result.name}
                  </span>
                  <span className="text-xs text-gray-500">{result.detail}</span>
                </Link>
              ))}
              {matches.length === 0 && (
                <p className="p-4 text-sm text-gray-500">No matching records</p>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            aria-label="Open workspace activity"
            onClick={() => setActivityOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Bell size={20} />
          </button>
          {user && (
            <div className="hidden md:flex items-center gap-3">
              <Avatar name={user.name} size="md" />
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Local demo</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal
        key={location.pathname}
        isOpen={activityOpen}
        onClose={() => setActivityOpen(false)}
        title="Workspace activity"
      >
        <p className="text-sm text-gray-600 mb-4">
          Recent changes saved in this browser
        </p>
        <ul className="space-y-3">
          {data.activities.slice(0, 20).map((a) => (
            <li key={a.id} className="border-b pb-3 text-sm">
              <p className="break-words">{a.details}</p>
              <p className="text-xs text-gray-500 mt-1">{formatDate(a.date)}</p>
            </li>
          ))}
        </ul>
        {data.activities.length === 0 && (
          <p className="text-sm text-gray-500">No workspace changes yet</p>
        )}
      </Modal>
    </header>
  );
}

import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building,
  CheckSquare,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Companies", href: "/companies", icon: Building },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];
export function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <aside className="w-full md:w-60 shrink-0 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col">
      <div className="px-4 py-3 md:p-6 flex justify-between md:block">
        <div>
          <p className="text-lg font-bold text-gray-900">Admin Dashboard</p>
          <p className="text-xs text-gray-500">Local CRM workspace</p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="md:hidden p-2 text-gray-600"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
      <nav
        aria-label="Main navigation"
        className="grid grid-cols-3 md:flex md:flex-col md:flex-1 gap-1 px-2 pb-2 md:px-4"
      >
        {navigation.map((item) => (
          <NavLink
            end={item.href === "/"}
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg min-w-0 whitespace-nowrap text-sm md:text-base ${isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="hidden md:block p-4 border-t border-gray-200">
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}

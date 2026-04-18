import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, FileText, Bot, Sparkles, Pill, FolderOpen, Activity, LogOut } from 'lucide-react';

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { to: "/symptoms", label: "Log Symptoms", icon: <FileText size={18} /> },
  { to: "/analysis", label: "AI Analysis", icon: <Bot size={18} /> },
  { to: "/whatif", label: "What-If", icon: <Sparkles size={18} /> },
  { to: "/medicines", label: "Medicines", icon: <Pill size={18} /> },
  { to: "/history", label: "History", icon: <FolderOpen size={18} /> },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar hidden md:flex">
        <div className="p-5 border-b border-[var(--color-border)]">
          <NavLink to="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="Noरोग Logo" className="w-8 h-8 object-contain rounded-md shadow-sm" />
            <div>
              <div className="text-[17px] font-extrabold text-[var(--color-text)]">Noरोग</div>
            </div>
          </NavLink>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          <p className="px-5 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="flex items-center justify-center w-5">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-brand)] flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate text-[var(--color-text)]">{user?.name || "User"}</div>
              <div className="text-[10px] text-[var(--color-text-muted)] truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors py-1.5 rounded-lg hover:bg-[var(--color-danger-alpha)] px-2">
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <div className="bottom-tabs md:hidden">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `bottom-tab ${isActive ? "active" : ""}`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </>
  );
}

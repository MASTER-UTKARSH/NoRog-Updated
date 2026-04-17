import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/symptoms", label: "Log Symptoms", icon: "📋" },
  { to: "/analysis", label: "AI Analysis", icon: "🤖" },
  { to: "/whatif", label: "What-If", icon: "🔮" },
  { to: "/medicines", label: "Medicines", icon: "💊" },
  { to: "/history", label: "My History", icon: "📁" },
  { to: "/report", label: "Doctor Report", icon: "📄" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar hidden md:flex">
        <div className="p-5 border-b border-[var(--color-border)]">
          <NavLink to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                 style={{ background: "linear-gradient(135deg, var(--color-brand), var(--color-accent))" }}>
              🩺
            </div>
            <div>
              <div className="text-lg font-bold gradient-text">NoRog</div>
              <div className="text-[10px] text-[var(--color-text-muted)]">Disease Monitor</div>
            </div>
          </NavLink>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-brand)] flex items-center justify-center text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.name || "User"}</div>
              <div className="text-xs text-[var(--color-text-muted)] truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} className="w-full text-left text-xs text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors py-2">
            ← Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="bottom-tabs md:hidden">
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
        <NavLink
          to="/history"
          className={({ isActive }) => `bottom-tab ${isActive ? "active" : ""}`}
        >
          <span>📁</span>
          <span>More</span>
        </NavLink>
      </nav>
    </>
  );
}

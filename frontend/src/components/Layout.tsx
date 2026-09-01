import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/", label: "Dashboard", icon: "◆" },
  { to: "/credit-cards", label: "Credit cards", icon: "▤" },
  { to: "/emis", label: "EMIs & loans", icon: "▥" },
  { to: "/reminders", label: "Reminders", icon: "◷" },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <aside
        className="w-60 shrink-0 border-r flex flex-col justify-between py-6 px-4"
        style={{ borderColor: "var(--border)" }}
      >
        <div>
          <div className="flex items-center gap-2 px-2 mb-8">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold"
              style={{ background: "var(--mint)", color: "#06251A" }}
            >
              L
            </div>
            <span className="font-display font-semibold tracking-tight">Life Finance</span>
          </div>

          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive ? "font-medium" : ""
                  }`
                }
                style={({ isActive }) => ({
                  background: isActive ? "var(--surface-2)" : "transparent",
                  color: isActive ? "var(--text)" : "var(--text-dim)",
                })}
              >
                <span aria-hidden style={{ color: "var(--mint)" }}>
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="px-2">
          <div className="text-xs mb-2" style={{ color: "var(--text-dim)" }}>
            {user?.full_name || user?.email}
          </div>
          <button
            onClick={logout}
            className="text-xs px-3 py-1.5 rounded-lg border w-full text-left transition-colors hover:opacity-80"
            style={{ borderColor: "var(--border)", color: "var(--text-dim)" }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

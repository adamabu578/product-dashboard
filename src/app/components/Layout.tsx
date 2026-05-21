import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuthStore } from "../store/auth";
import { Package, Plus, LogOut, Menu, X, ChevronRight } from "lucide-react";
import { cn } from "./ui/utils";

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { to: "/products", label: "Products", icon: Package, end: true },
    { to: "/products/new", label: "Add Product", icon: Plus, end: true },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-12 bg-primary text-primary-foreground border-b border-white/10 flex items-center px-4 gap-3 sticky top-0 z-40 shrink-0">
        <NavLink
          to="/products"
          className="flex items-center gap-2 shrink-0 mr-2"
          aria-label="ProductOps home"
        >
          <div className="size-6 rounded bg-[#3b82f6] flex items-center justify-center shrink-0">
            <Package size={13} className="text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight hidden sm:block">
            ProductOps
          </span>
        </NavLink>

        <div className="w-px h-5 bg-white/15 hidden sm:block" aria-hidden />

        <nav className="hidden sm:flex items-center gap-0.5" aria-label="Main navigation">
          {navLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 px-3 h-7 rounded text-xs font-medium transition-colors",
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:text-white/90 hover:bg-white/8"
                )
              }
            >
              <Icon size={12} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-xs text-white/50">
            <div className="size-5 rounded-full bg-white/15 flex items-center justify-center text-white/80 font-medium">
              {user?.name.charAt(0)}
            </div>
            <span>{user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Log out"
            className="flex items-center gap-1.5 px-2.5 h-7 rounded text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut size={12} />
            <span className="hidden sm:block">Sign out</span>
          </button>

          <button
            className="sm:hidden p-1.5 text-white/70 hover:text-white transition-colors rounded"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div
          className="sm:hidden bg-primary border-b border-white/10 px-3 py-2 flex flex-col gap-0.5"
          role="navigation"
          aria-label="Mobile navigation"
        >
          {navLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors",
                  isActive ? "bg-white/15 text-white" : "text-white/60"
                )
              }
            >
              <Icon size={14} />
              {label}
              <ChevronRight size={13} className="ml-auto opacity-40" />
            </NavLink>
          ))}
          <div className="mt-2 pt-2 border-t border-white/10 px-3 pb-1">
            <p className="text-xs text-white/40">{user?.email}</p>
            <p className="text-xs text-white/30">{user?.role}</p>
          </div>
        </div>
      )}

      <main className="flex-1 min-h-0">
        <Outlet />
      </main>
    </div>
  );
}

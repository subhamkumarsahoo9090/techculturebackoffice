import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/blogs", label: "Blog" },
  { to: "/careers", label: "Careers" },
  { to: "/team", label: "Team" },
];

export default function Shell() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff_0%,#f0fdfa55_45%,#faf9f6_100%)]">
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-[#2E3545]/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col overflow-hidden border-r border-[#E8E6E1] bg-white transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="shrink-0 border-b border-[#E8E6E1] px-5 py-6">
          <img
            src="/logo.png"
            alt="TechCulture AI"
            className="h-16 w-auto max-w-full object-contain object-left"
          />
          <div className="mt-4 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FE602F]">
              Backoffice
            </p>
            <p className="text-base font-semibold leading-snug text-[#2E3545]">
              TechCulture AI
            </p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-gradient-to-r from-teal-700 to-[#FE602F] text-white shadow-sm"
                    : "text-slate-600 hover:bg-teal-50 hover:text-teal-800"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto shrink-0 border-t border-[#E8E6E1] p-4">
          <p className="truncate text-xs font-medium text-slate-500">{admin?.email}</p>
          <button
            className="btn-ghost mt-3 w-full !rounded-xl"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col lg:ml-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[#E8E6E1] bg-white/90 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            className="rounded-lg border border-[#E8E6E1] px-3 py-2 text-sm font-semibold text-[#2E3545]"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            Menu
          </button>
          <p className="text-sm font-semibold text-[#2E3545]">TechCulture AI Admin</p>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

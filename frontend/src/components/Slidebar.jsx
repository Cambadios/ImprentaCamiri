import React from "react";
import { Link, useLocation } from "react-router-dom";

const items = [
  { to: "/dashboard",  label: "Dashboard",  icon: "📊" },
  { to: "/clientes",   label: "Cliente",    icon: "🧑‍💼" },
  { to: "/pedidos",    label: "Pedido",     icon: "📋" },
  { to: "/inventario", label: "Inventario", icon: "📦" },
  { to: "/productos",  label: "Productos",  icon: "🧾" },
  { to: "/usuarios",   label: "Usuarios",   icon: "👤" },
  { to: "/reportes",   label: "Reportes",   icon: "📑" },
];

export default function Sidebar({ open, onClose }) {
  const { pathname } = useLocation();

  return (
    <>
      {/* Overlay móvil */}
      <div
        className={`md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer móvil / fija en ≥md */}
      <aside
        className={`
          md:static md:translate-x-0 md:opacity-100 md:pointer-events-auto
          fixed left-0 top-0 bottom-0 z-50 w-[84%] max-w-[320px]
          bg-stone-100 border-r border-stone-200
          px-4 sm:px-5 py-4 overflow-y-auto
          transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          rounded-r-2xl md:rounded-none
        `}
        aria-label="Sidebar"
      >
        <div className="md:hidden mb-4 flex items-center justify-between">
          <div className="font-bold">IMPRENTA CAMIRI</div>
          <button onClick={onClose} className="rounded-xl border px-3 py-1.5">✕</button>
        </div>

        <div className="hidden md:flex items-center gap-3 mb-6">
          <div className="size-12 rounded-full bg-white shadow grid place-content-center text-xs font-bold">LOGO</div>
          <div className="text-sm">
            <div className="font-semibold">IMPRENTA</div>
            <div className="text-stone-500">CAMIRI</div>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {items.map((it) => {
            const active = pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 border text-sm transition-all
                ${active
                  ? "border-stone-400 bg-stone-200/80 shadow-sm"
                  : "border-stone-200 bg-white hover:bg-stone-100"
                }`}
              >
                <span className="text-lg">{it.icon}</span>
                <span className="font-medium tracking-wide">{it.label.toUpperCase()}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

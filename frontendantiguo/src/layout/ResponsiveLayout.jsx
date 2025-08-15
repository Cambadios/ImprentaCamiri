import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function ResponsiveLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-[100svh] bg-stone-50 text-stone-800">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-100/80 backdrop-blur border-b border-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button
            className="md:hidden inline-flex items-center gap-2 rounded-xl px-3 py-2 border border-stone-300"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            <span>☰</span><span>Menú</span>
          </button>
          <h1 className="text-lg font-semibold truncate">Imprenta Camiri</h1>
          <div className="flex items-center gap-2 rounded-xl border border-stone-300 px-3 py-1.5">
            <span className="size-6 rounded-full bg-stone-300 grid place-content-center text-sm">M</span>
            <span className="hidden sm:inline">Mishel Ampuero</span>
          </div>
        </div>
      </header>

      {/* Shell responsive */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-[260px,1fr] gap-6 md:gap-8 py-6">
          <Sidebar open={open} onClose={() => setOpen(false)} />
          <main className="min-w-0">
            <div className="space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

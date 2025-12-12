// src/components/layout/SidebarLogistica.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function SidebarLogistica() {
  return (
    <nav className="flex flex-col gap-1 p-4">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `text-sm rounded-lg px-3 py-2 font-medium ${
            isActive ? "bg-emerald-700 text-white" : "text-slate-700 hover:bg-slate-100"
          }`
        }
      >
        Painel Logística 2026
      </NavLink>
      <NavLink
        to="/calendario"
        className={({ isActive }) =>
          `text-sm rounded-lg px-3 py-2 font-medium ${
            isActive ? "bg-emerald-700 text-white" : "text-slate-700 hover:bg-slate-100"
          }`
        }
      >
        Calendário
      </NavLink>
      <NavLink
        to="/custos"
        className={({ isActive }) =>
          `text-sm rounded-lg px-3 py-2 font-medium ${
            isActive ? "bg-emerald-700 text-white" : "text-slate-700 hover:bg-slate-100"
          }`
        }
      >
        Painel de Custos
      </NavLink>
      {/* coloca aqui os outros itens que já tem no menu lateral */}
    </nav>
  );
}

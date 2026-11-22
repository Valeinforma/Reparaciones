// ============================================================
// src/Components/EquipoContext/EquipoContext.tsx
// ------------------------------------------------------------
// Contexto + Provider en el mismo archivo (patrón ToDoApp).
// AppEquipos lo anida dentro de ClienteProvider para que el
// formulario pueda listar los clientes en un <select>.
// ============================================================

import React from "react";
import useEquiposApi from "../../Hooks/useEquiposApi";

export type EquipoContextType = ReturnType<typeof useEquiposApi>;

const EquipoContext = React.createContext<EquipoContextType | null>(null);

export function EquipoProvider({ children }: { children: React.ReactNode }) {
  const equipoApi = useEquiposApi();

  return (
    <EquipoContext.Provider value={equipoApi}>
      {children}
    </EquipoContext.Provider>
  );
}

export function useEquipoContext(): EquipoContextType {
  const context = React.useContext(EquipoContext);

  if (!context) {
    throw new Error("useEquipoContext debe utilizarse dentro de un EquipoProvider");
  }

  return context;
}

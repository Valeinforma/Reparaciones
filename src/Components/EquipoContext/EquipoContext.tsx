
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
  
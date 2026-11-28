import { createContext, useContext } from "react";
import type useEquiposApi from "../../Hooks/useEquiposApi";

export type EquipoContextType = ReturnType<typeof useEquiposApi>;

export const EquipoContext = createContext<EquipoContextType | null>(null);

export function useEquipoContext(): EquipoContextType {
  const context = useContext(EquipoContext);

  if (context === null) {
    throw new Error("useEquipoContext debe usarse dentro de un EquipoProvider");
  }

  return context;
}

import { createContext, useContext } from "react";
import type useOrdenesApi from "../../Hooks/useOrdenesApi";

export type OrdenContextType = ReturnType<typeof useOrdenesApi>;

export const OrdenContext = createContext<OrdenContextType | null>(null);

export function useOrdenContext(): OrdenContextType {
  const context = useContext(OrdenContext);

  if (context === null) {
    throw new Error("useOrdenContext debe usarse dentro de un OrdenProvider");
  }

  return context;
}

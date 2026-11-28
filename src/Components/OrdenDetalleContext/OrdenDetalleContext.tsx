import { createContext, useContext } from "react";
import type useOrdenDetalleApi from "../../Hooks/useOrdenDetalleApi";

export type OrdenDetalleContextType = ReturnType<typeof useOrdenDetalleApi>;

export const OrdenDetalleContext =
  createContext<OrdenDetalleContextType | null>(null);

export function useOrdenDetalleContext(): OrdenDetalleContextType {
  const context = useContext(OrdenDetalleContext);

  if (context === null) {
    throw new Error(
      "useOrdenDetalleContext debe usarse dentro de un OrdenDetalleProvider",
    );
  }

  return context;
}

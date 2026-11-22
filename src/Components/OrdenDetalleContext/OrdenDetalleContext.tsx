

import React from "react";
import useOrdenDetalleApi from "../../Hooks/useOrdenDetalleApi";

export type OrdenDetalleContextType = ReturnType<typeof useOrdenDetalleApi>;

const OrdenDetalleContext =
  React.createContext<OrdenDetalleContextType | null>(null);

interface OrdenDetalleProviderProps {
  id: number;
  children: React.ReactNode;
}

export function OrdenDetalleProvider({
  id,
  children,
}: OrdenDetalleProviderProps) {
  const detalleApi = useOrdenDetalleApi(id);

  return (
    <OrdenDetalleContext.Provider value={detalleApi}>
      {children}
    </OrdenDetalleContext.Provider>
  );
}

export function useOrdenDetalleContext(): OrdenDetalleContextType {
  const context = React.useContext(OrdenDetalleContext);

  if (!context) {
    throw new Error(
      "useOrdenDetalleContext debe utilizarse dentro de un OrdenDetalleProvider",
    );
  }

  return context;
}

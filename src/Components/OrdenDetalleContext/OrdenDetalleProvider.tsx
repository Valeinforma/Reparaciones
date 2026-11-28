import type { ReactNode } from "react";
import useOrdenDetalleApi from "../../Hooks/useOrdenDetalleApi";
import { OrdenDetalleContext } from "./OrdenDetalleContext";

interface OrdenDetalleProviderProps {
  id: number;
  children: ReactNode;
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

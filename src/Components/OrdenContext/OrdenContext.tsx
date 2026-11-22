
import React from "react";
import useOrdenesApi from "../../Hooks/useOrdenesApi";

export type OrdenContextType = ReturnType<typeof useOrdenesApi>;

const OrdenContext = React.createContext<OrdenContextType | null>(null);

export function OrdenProvider({ children }: { children: React.ReactNode }) {
  const ordenApi = useOrdenesApi();

  return (
    <OrdenContext.Provider value={ordenApi}>{children}</OrdenContext.Provider>
  );
}

export function useOrdenContext(): OrdenContextType {
  const context = React.useContext(OrdenContext);

  if (!context) {
    throw new Error("useOrdenContext debe utilizarse dentro de un OrdenProvider");
  }

  return context;
}

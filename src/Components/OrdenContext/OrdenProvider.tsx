import type { ReactNode } from "react";
import useOrdenesApi from "../../Hooks/useOrdenesApi";
import { OrdenContext } from "./OrdenContext";

export function OrdenProvider({ children }: { children: ReactNode }) {
  const ordenApi = useOrdenesApi();

  return (
    <OrdenContext.Provider value={ordenApi}>
      {children}
    </OrdenContext.Provider>
  );
}

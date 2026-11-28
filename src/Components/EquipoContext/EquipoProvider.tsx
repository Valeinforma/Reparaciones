import type { ReactNode } from "react";
import useEquiposApi from "../../Hooks/useEquiposApi";
import { EquipoContext } from "./EquipoContext";

export function EquipoProvider({ children }: { children: ReactNode }) {
  const equipoApi = useEquiposApi();

  return (
    <EquipoContext.Provider value={equipoApi}>
      {children}
    </EquipoContext.Provider>
  );
}


import React from "react";
import useClientesApi from "../../Hooks/useClientesApi";

export type ClienteContextType = ReturnType<typeof useClientesApi>;

const ClienteContext = React.createContext<ClienteContextType | null>(null);

export function ClienteProvider({ children }: { children: React.ReactNode }) {
  const clienteApi = useClientesApi();

  return (
    <ClienteContext.Provider value={clienteApi}>
      {children}
    </ClienteContext.Provider>
  );
}

export function useClienteContext(): ClienteContextType {
  const context = React.useContext(ClienteContext);

  if (!context) {
    throw new Error("useClienteContext debe utilizarse dentro de un ClienteProvider");
  }

  return context;
}

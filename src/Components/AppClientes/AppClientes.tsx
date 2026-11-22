import { ClienteProvider } from "../ClienteContext/ClienteContext";
import ClientesList from "../ClientesList/ClientesList";

export default function AppClientes() {
  return (
    <ClienteProvider>
      <ClientesList />
    </ClienteProvider>
  );
}

import { ClienteProvider } from "../ClienteContext/ClienteProvider";
import ClientesList from "../ClientesList/ClientesList";

export default function AppClientes() {
  return (
    <ClienteProvider>
      <ClientesList />
    </ClienteProvider>
  );
}

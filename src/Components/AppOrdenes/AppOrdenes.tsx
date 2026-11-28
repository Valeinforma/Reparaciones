import { ClienteProvider } from "../ClienteContext/ClienteProvider";
import { OrdenProvider } from "../OrdenContext/OrdenProvider";
import OrdenesList from "../OrdenesList/OrdenesList";

export default function AppOrdenes() {
  return (
    <ClienteProvider>
      <OrdenProvider>
        <OrdenesList />
      </OrdenProvider>
    </ClienteProvider>
  );
}

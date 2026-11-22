import { ClienteProvider } from "../ClienteContext/ClienteContext";
import { OrdenProvider } from "../OrdenContext/OrdenContext";
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

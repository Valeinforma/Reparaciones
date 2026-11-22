import { ClienteProvider } from "../ClienteContext/ClienteContext";
import { EquipoProvider } from "../EquipoContext/EquipoContext";
import EquiposList from "../EquiposList/EquiposList";


export default function AppEquipos() {
  return (
    <ClienteProvider>
      <EquipoProvider>
        <EquiposList />
      </EquipoProvider>
    </ClienteProvider>
  );
}

import { ClienteProvider } from "../ClienteContext/ClienteProvider";
import { EquipoProvider } from "../EquipoContext/EquipoProvider";
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

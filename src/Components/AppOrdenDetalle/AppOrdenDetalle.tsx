import { useParams } from "react-router-dom";
import { OrdenDetalleProvider } from "../OrdenDetalleContext/OrdenDetalleContext";
import OrdenDetalle from "../OrdenDetalle/OrdenDetalle";

export default function AppOrdenDetalle() {
  const { id } = useParams<{ id: string }>();
  const ordenId = Number(id);


  if (!Number.isInteger(ordenId) || ordenId <= 0) {
    return <p className="estado estado--error">La orden solicitada no existe.</p>;
  }

  return (
    <OrdenDetalleProvider id={ordenId}>
      <OrdenDetalle />
    </OrdenDetalleProvider>
  );
}

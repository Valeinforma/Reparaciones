import { useParams } from "react-router-dom";
import { OrdenDetalleProvider } from "../OrdenDetalleContext/OrdenDetalleProvider";
import OrdenDetalle from "../OrdenDetalle/OrdenDetalle";

export default function AppOrdenDetalle() {
  const { id } = useParams<{ id: string }>();
  const ordenId = Number(id);

  if (!Number.isInteger(ordenId) || ordenId <= 0) {
    return (
      <p style={{ color: "#f87171", textAlign: "center", padding: "40px 0" }}>
        La orden solicitada no existe.
      </p>
    );
  }

  return (
    <OrdenDetalleProvider id={ordenId}>
      <OrdenDetalle />
    </OrdenDetalleProvider>
  );
}

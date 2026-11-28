import Chip from "@mui/material/Chip";
import {
  ETIQUETAS_ESTADO,
  type EstadoOrden,
} from "../../Hooks/useOrdenesApi";

const COLORES: Record<
  EstadoOrden,
  "default" | "info" | "warning" | "primary" | "success" | "error"
> = {
  Recibido: "default",
  EnDiagnostico: "info",
  Presupuestado: "warning",
  EnReparacion: "primary",
  Listo: "success",
  Entregado: "success",
  Cancelado: "error",
};

export default function EstadoBadge({ estado }: { estado: EstadoOrden }) {
  return (
    <Chip
      size="small"
      label={ETIQUETAS_ESTADO[estado]}
      color={COLORES[estado]}
      variant={estado === "Entregado" ? "outlined" : "filled"}
    />
  );
}

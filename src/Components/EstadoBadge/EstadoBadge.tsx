import {
  ETIQUETAS_ESTADO,
  type EstadoOrden,
} from "../../Hooks/useOrdenesApi";
import "./EstadoBadge.css";


export default function EstadoBadge({ estado }: { estado: EstadoOrden }) {
  return (
    <span className={`badge badge--${estado.toLowerCase()}`}>
      {ETIQUETAS_ESTADO[estado]}
    </span>
  );
}

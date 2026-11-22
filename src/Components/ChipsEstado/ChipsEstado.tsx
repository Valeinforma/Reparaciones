import {
  ETIQUETAS_ESTADO,
  type EstadoOrden,
  type FiltroEstado,
} from "../../Hooks/useOrdenesApi";
import "./ChipsEstado.css";


const ORDEN_CHIPS: FiltroEstado[] = [
  "Todos",
  "Recibido",
  "EnDiagnostico",
  "Presupuestado",
  "EnReparacion",
  "Listo",
  "Entregado",
  "Cancelado",
];

interface ChipsEstadoProps {
  filtro: FiltroEstado;
  onFiltro: (filtro: FiltroEstado) => void;
  conteos: Record<EstadoOrden, number>;
  total: number;
}

export default function ChipsEstado({
  filtro,
  onFiltro,
  conteos,
  total,
}: ChipsEstadoProps) {
  return (
    <div className="chips">
      {ORDEN_CHIPS.map((chip) => {
        const cantidad = chip === "Todos" ? total : conteos[chip];
        return (
          <button
            key={chip}
            type="button"
            className={`chip${filtro === chip ? " chip--activo" : ""}`}
            onClick={() => onFiltro(chip)}
          >
            {chip === "Todos" ? "Todos" : ETIQUETAS_ESTADO[chip]}
            <span className="chip__conteo">{cantidad}</span>
          </button>
        );
      })}
    </div>
  );
}

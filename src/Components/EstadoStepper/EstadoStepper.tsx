import {
  FLUJO_ESTADOS,
  ETIQUETAS_ESTADO,
  type EstadoOrden,
} from "../../Hooks/useOrdenesApi";
import "./EstadoStepper.css";

export default function EstadoStepper({ estado }: { estado: EstadoOrden }) {
  if (estado === "Cancelado") {
    return (
      <div className="stepper stepper--cancelado">
        <span className="stepper__cancelado">Orden cancelada</span>
      </div>
    );
  }

  const actual = FLUJO_ESTADOS.indexOf(estado);

  return (
    <ol className="stepper">
      {FLUJO_ESTADOS.map((paso, indice) => {
        const completado = indice < actual;
        const activo = indice === actual;
        return (
          <li
            key={paso}
            className={`stepper__paso${completado ? " stepper__paso--completado" : ""}${
              activo ? " stepper__paso--activo" : ""
            }`}
          >
            <span className="stepper__punto">{completado ? "✓" : indice + 1}</span>
            <span className="stepper__texto">{ETIQUETAS_ESTADO[paso]}</span>
          </li>
        );
      })}
    </ol>
  );
}

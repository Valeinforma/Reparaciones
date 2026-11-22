import { useState } from "react";
import Modal from "../Modal/Modal";
import { useOrdenDetalleContext } from "../OrdenDetalleContext/OrdenDetalleContext";
import {
  ETIQUETAS_ESTADO,
  type EstadoOrden,
} from "../../Hooks/useOrdenesApi";
import "./ModalCambioEstado.css";

interface ModalCambioEstadoProps {
  destino: EstadoOrden;
  onCerrar: () => void;
}


function etiquetaNota(destino: EstadoOrden): string {
  if (destino === "EnDiagnostico") return "Diagnóstico";
  if (destino === "Listo") return "Solución aplicada";
  if (destino === "Cancelado") return "Motivo de la cancelación";
  return "Nota / observación";
}

export default function ModalCambioEstado({
  destino,
  onCerrar,
}: ModalCambioEstadoProps) {
  const { cambiarEstado } = useOrdenDetalleContext();

  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();

    if (guardando) return;

    setGuardando(true);
    setError(null);

    try {
      await cambiarEstado(destino, nota);
      onCerrar();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "No se pudo cambiar el estado.",
      );
      setGuardando(false);
    }
  }

  return (
    <Modal
      titulo={`Pasar a ${ETIQUETAS_ESTADO[destino]}`}
      onCerrar={onCerrar}
    >
      <form className="form-cambio-estado" onSubmit={confirmar}>
        <p className="form-cambio-estado__texto">
          La orden va a quedar en estado{" "}
          <strong>{ETIQUETAS_ESTADO[destino]}</strong>. La nota es opcional.
        </p>

        <label>
          {etiquetaNota(destino)}
          <textarea
            rows={4}
            maxLength={2000}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder={
              destino === "EnDiagnostico"
                ? "Que se detecto al revisar el equipo.."
                : destino === "Listo"
                  ? "Que se hizo para resolver la falla.."
                  : "Detalle adicional.."
            }
            autoFocus
          />
        </label>

        {error && <p className="form-cambio-estado__error">{error}</p>}

        <div className="modal-acciones">
          <button
            type="button"
            className="boton-secundario"
            onClick={onCerrar}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={destino === "Cancelado" ? "boton-peligro" : "boton-primario"}
            disabled={guardando}
          >
            {guardando
              ? "Guardando…"
              : destino === "Cancelado"
                ? "Cancelar orden"
                : `Confirmar ${ETIQUETAS_ESTADO[destino]}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}

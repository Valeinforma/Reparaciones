import { useState } from "react";
import Modal from "../Modal/Modal";
import { useOrdenDetalleContext } from "../OrdenDetalleContext/OrdenDetalleContext";
import { paraInputFecha } from "../../Hooks/useOrdenesApi";
import "./ModalEditarOrden.css";


export default function ModalEditarOrden({
  onCerrar,
}: {
  onCerrar: () => void;
}) {
  const { orden, editarOrden } = useOrdenDetalleContext();

  const [problemaReportado, setProblemaReportado] = useState(
    orden?.problemaReportado ?? "",
  );
  const [fechaEstimada, setFechaEstimada] = useState(
    paraInputFecha(orden?.fechaEstimada),
  );
  const [observaciones, setObservaciones] = useState(
    orden?.observaciones ?? "",
  );

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function alGuardar(e: React.FormEvent) {
    e.preventDefault();

    if (guardando) return;

    if (problemaReportado.length > 1000) {
      setError("El problema reportado no puede superar los 1000 caracteres.");
      return;
    }

    if (observaciones.length > 2000) {
      setError("Las observaciones no pueden superar los 2000 caracteres.");
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      await editarOrden({
        problemaReportado: problemaReportado.trim() || null,
        fechaEstimada: fechaEstimada || null,
        observaciones: observaciones.trim() || null,
      });
      onCerrar();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
      setGuardando(false);
    }
  }

  return (
    <Modal titulo="Editar orden" onCerrar={onCerrar}>
      <form className="form-editar-orden" onSubmit={alGuardar}>
        <label>
          Fecha estimada de entrega
          <input
            type="date"
            value={fechaEstimada}
            onChange={(e) => setFechaEstimada(e.target.value)}
          />
        </label>

        <label>
          Problema reportado
          <textarea
            rows={3}
            maxLength={1000}
            value={problemaReportado}
            onChange={(e) => setProblemaReportado(e.target.value)}
          />
        </label>

        <label>
          Observaciones
          <textarea
            rows={3}
            maxLength={2000}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </label>

        {error && <p className="form-editar-orden__error">{error}</p>}

        <div className="modal-acciones">
          <button
            type="button"
            className="boton-secundario"
            onClick={onCerrar}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button type="submit" className="boton-primario" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

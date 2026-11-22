import { useState } from "react";
import Modal from "../Modal/Modal";
import { useOrdenDetalleContext } from "../OrdenDetalleContext/OrdenDetalleContext";
import { formatearMoneda } from "../../Hooks/useOrdenesApi";
import type { TipoLinea } from "../../Hooks/useOrdenDetalleApi";
import "./ModalAgregarLinea.css";

interface ModalAgregarLineaProps {
  tipo: TipoLinea;
  onCerrar: () => void;
}

export default function ModalAgregarLinea({
  tipo,
  onCerrar,
}: ModalAgregarLineaProps) {
  const { servicios, repuestos, orden, agregarLinea } =
    useOrdenDetalleContext();

  const [itemId, setItemId] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esServicio = tipo === "servicio";
  const titulo = esServicio ? "Agregar servicio" : "Agregar repuesto";

  const servicioElegido = servicios.find((servicio) => servicio.id === itemId);
  const repuestoElegido = repuestos.find((repuesto) => repuesto.id === itemId);

  const precio = esServicio
    ? (servicioElegido?.precio ?? 0)
    : (repuestoElegido?.precio ?? 0);

  const stock = esServicio ? null : (repuestoElegido?.stock ?? 0);

  const yaAgregado = esServicio
    ? (orden?.detallesServicios.find(
        (detalle) => detalle.servicioId === itemId,
      )?.cantidad ?? 0)
    : (orden?.detallesRepuestos.find(
        (detalle) => detalle.repuestoId === itemId,
      )?.cantidad ?? 0);

  const sinCatalogo = esServicio ? servicios.length === 0 : repuestos.length === 0;

  async function alGuardar(e: React.FormEvent) {
    e.preventDefault();

    if (guardando) return;

    if (!itemId) {
      setError(esServicio ? "Elegi un servicio." : "Elegi un repuesto.");
      return;
    }

    if (!Number.isInteger(cantidad) || cantidad < 1) {
      setError("La cantidad debe ser un numero entero mayor o igual a 1.");
      return;
    }

    if (stock !== null && cantidad > stock) {
      setError(`Stock insuficiente: quedan ${stock} unidades.`);
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      await agregarLinea(tipo, itemId, cantidad);
      onCerrar();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo agregar.");
      setGuardando(false);
    }
  }

  return (
    <Modal titulo={titulo} onCerrar={onCerrar}>
      {sinCatalogo ? (
        <>
          <p className="estado">
            No hay {esServicio ? "servicios" : "repuestos"} activos disponibles.
          </p>
          <div className="modal-acciones">
            <button type="button" className="boton-secundario" onClick={onCerrar}>
              Cerrar
            </button>
          </div>
        </>
      ) : (
        <form className="form-linea" onSubmit={alGuardar}>
          <label>
            {esServicio ? "Servicio" : "Repuesto"}
            <select
              value={itemId}
              onChange={(e) => setItemId(Number(e.target.value))}
              autoFocus
            >
              <option value={0}>Selecciona una opcion…</option>
              {esServicio
                ? servicios.map((servicio) => (
                    <option key={servicio.id} value={servicio.id}>
                      {servicio.nombre} — {formatearMoneda(servicio.precio)}
                    </option>
                  ))
                : repuestos.map((repuesto) => (
                    <option key={repuesto.id} value={repuesto.id}>
                      {repuesto.nombre} — {formatearMoneda(repuesto.precio)} (stock{" "}
                      {repuesto.stock})
                    </option>
                  ))}
            </select>
          </label>

          <label>
            Cantidad
            <input
              type="number"
              min={1}
              step={1}
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
            />
          </label>

          {itemId > 0 && (
            <div className="form-linea__resumen">
              <span>
                Precio unitario: <strong>{formatearMoneda(precio)}</strong>
              </span>
              <span>
                Subtotal: <strong>{formatearMoneda(precio * cantidad)}</strong>
              </span>
              {stock !== null && (
                <span>
                  Stock disponible: <strong>{stock}</strong>
                </span>
              )}
              {yaAgregado > 0 && (
                <span>
                  Ya en la orden: <strong>{yaAgregado}</strong>
                </span>
              )}
            </div>
          )}

          {error && <p className="form-linea__error">{error}</p>}

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
              {guardando ? "Agregando…" : "Agregar"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

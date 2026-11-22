import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useOrdenDetalleContext } from "../OrdenDetalleContext/OrdenDetalleContext";
import { useSesion } from "../../Hooks/useSesion";
import EstadoBadge from "../EstadoBadge/EstadoBadge";
import EstadoStepper from "../EstadoStepper/EstadoStepper";
import ModalEditarOrden from "../ModalEditarOrden/ModalEditarOrden";
import ModalCambioEstado from "../ModalCambioEstado/ModalCambioEstado";
import ModalAgregarLinea from "../ModalAgregarLinea/ModalAgregarLinea";
import Modal from "../Modal/Modal";
import {
  describirEquipo,
  ETIQUETAS_ESTADO,
  formatearFecha,
  formatearFechaHora,
  formatearMoneda,
  transicionesDesde,
} from "../../Hooks/useOrdenesApi";
import "./OrdenDetalle.css";

export default function OrdenDetalle() {
  const {
    orden,
    sinPermisoRepuestos,
    cargando,
    error,
    cargarOrden,
    quitarLinea,
    eliminarOrden,
    openEditar,
    setOpenEditar,
    estadoDestino,
    setEstadoDestino,
    lineaNueva,
    setLineaNueva,
    lineaAQuitar,
    setLineaAQuitar,
    openEliminar,
    setOpenEliminar,
  } = useOrdenDetalleContext();

  const sesion = useSesion();
  const navigate = useNavigate();
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  async function confirmarQuitarLinea() {
    if (!lineaAQuitar) return;

    setErrorAccion(null);

    try {
      await quitarLinea(lineaAQuitar.tipo, lineaAQuitar.detalleId);
      setLineaAQuitar(null);
    } catch (err: unknown) {
      setErrorAccion(
        err instanceof Error ? err.message : "No se pudo quitar la línea.",
      );
      setLineaAQuitar(null);
    }
  }

  async function confirmarEliminacion() {
    setErrorAccion(null);

    try {
      await eliminarOrden();
      setOpenEliminar(false);
      navigate("/ordenes", { replace: true });
    } catch (err: unknown) {
      setErrorAccion(
        err instanceof Error ? err.message : "No se pudo eliminar la orden.",
      );
      setOpenEliminar(false);
    }
  }

  if (cargando && !orden) {
    return <p className="estado">Cargando orden…</p>;
  }

  if (!orden) {
    return (
      <div className="estado estado--error">
        <p>{error ?? "La orden no existe."}</p>
        <div className="detalle-acciones">
          <button
            type="button"
            className="boton-secundario"
            onClick={() => cargarOrden()}
          >
            Reintentar
          </button>
          <Link to="/ordenes" className="boton-secundario">
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  // El rol Recepcion no tiene acceso a /api/repuestos
  const ocultarRepuestos = sinPermisoRepuestos || sesion?.rol === "Recepcion";
  const transiciones = transicionesDesde(orden.estado);

  return (
    <section className="detalle">
      <div className="detalle__cabecera">
        <div>
          <Link to="/ordenes" className="detalle__volver">
            ← Órdenes
          </Link>
          <div className="detalle__titulo">
            <h2>{orden.numeroOrden}</h2>
            <EstadoBadge estado={orden.estado} />
          </div>
          <p className="detalle__sub">
            {orden.clienteNombre} ·{" "}
            {describirEquipo(
              orden.equipoTipo,
              orden.equipoMarca,
              orden.equipoModelo,
            )}
          </p>
        </div>

        <div className="detalle-acciones">
          <button
            type="button"
            className="boton-secundario"
            onClick={() => setOpenEditar(true)}
          >
            Editar datos
          </button>
          <button
            type="button"
            className="boton-peligro"
            onClick={() => setOpenEliminar(true)}
          >
            Eliminar
          </button>
        </div>
      </div>

      {errorAccion && <div className="aviso-error">{errorAccion}</div>}

      <EstadoStepper estado={orden.estado} />

      <div className="detalle__paneles">
        <div className="panel">
          <h3 className="panel__titulo">Datos de la orden</h3>

          <dl className="datos">
            <div>
              <dt>Cliente</dt>
              <dd>{orden.clienteNombre}</dd>
            </div>
            <div>
              <dt>Equipo</dt>
              <dd>
                {describirEquipo(
                  orden.equipoTipo,
                  orden.equipoMarca,
                  orden.equipoModelo,
                )}
              </dd>
            </div>
            <div>
              <dt>Número de serie</dt>
              <dd>{orden.equipoNumeroSerie ?? "—"}</dd>
            </div>
            <div>
              <dt>Responsable</dt>
              <dd>{orden.usuarioNombre}</dd>
            </div>
            <div>
              <dt>Ingreso</dt>
              <dd>{formatearFechaHora(orden.fechaIngreso)}</dd>
            </div>
            <div>
              <dt>Estimada</dt>
              <dd>{formatearFecha(orden.fechaEstimada)}</dd>
            </div>
            <div>
              <dt>Entrega</dt>
              <dd>{formatearFechaHora(orden.fechaEntrega)}</dd>
            </div>
            <div>
              <dt>Costo total</dt>
              <dd className="datos__costo">{formatearMoneda(orden.costo)}</dd>
            </div>
          </dl>
        </div>

        <div className="panel">
          <h3 className="panel__titulo">Cambiar estado</h3>

          {transiciones.length === 0 ? (
            <p className="panel__texto">
              La orden está en estado{" "}
              <strong>{ETIQUETAS_ESTADO[orden.estado]}</strong> y no admite más
              cambios.
            </p>
          ) : (
            <>
              <p className="panel__texto">
                Estado actual: <strong>{ETIQUETAS_ESTADO[orden.estado]}</strong>
              </p>
              <div className="detalle-acciones detalle-acciones--wrap">
                {transiciones.map((estado) => (
                  <button
                    key={estado}
                    type="button"
                    className={
                      estado === "Cancelado"
                        ? "boton-peligro"
                        : "boton-primario"
                    }
                    onClick={() => setEstadoDestino(estado)}
                  >
                    {estado === "Cancelado"
                      ? "Cancelar orden"
                      : `Pasar a ${ETIQUETAS_ESTADO[estado]}`}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="detalle__textos">
        <div className="panel">
          <h3 className="panel__titulo">Problema reportado</h3>
          <p className="panel__texto">
            {orden.problemaReportado ?? "Sin datos."}
          </p>
        </div>

        <div className="panel">
          <h3 className="panel__titulo">Diagnóstico</h3>
          <p className="panel__texto">{orden.diagnostico ?? "Sin datos."}</p>
        </div>

        <div className="panel">
          <h3 className="panel__titulo">Solución</h3>
          <p className="panel__texto">{orden.solucion ?? "Sin datos."}</p>
        </div>

        <div className="panel">
          <h3 className="panel__titulo">Observaciones</h3>
          <p className="panel__texto">{orden.observaciones ?? "Sin datos."}</p>
        </div>
      </div>

      <div className="panel">
        <div className="lineas__cabecera">
          <h3 className="panel__titulo">Servicios</h3>
          <button
            type="button"
            className="boton-secundario"
            onClick={() => setLineaNueva("servicio")}
          >
            + Agregar servicio
          </button>
        </div>

        {orden.detallesServicios.length === 0 ? (
          <p className="panel__texto">Sin servicios cargados.</p>
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>Servicio</th>
                <th className="tabla__num">Cantidad</th>
                <th className="tabla__num">Precio</th>
                <th className="tabla__num">Subtotal</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orden.detallesServicios.map((detalle) => (
                <tr key={detalle.id}>
                  <td>{detalle.servicioNombre}</td>
                  <td className="tabla__num">{detalle.cantidad}</td>
                  <td className="tabla__num">{formatearMoneda(detalle.precio)}</td>
                  <td className="tabla__num">
                    {formatearMoneda(detalle.subtotal)}
                  </td>
                  <td className="tabla__acciones">
                    <button
                      type="button"
                      className="accion-quitar"
                      title="Quitar servicio"
                      onClick={() =>
                        setLineaAQuitar({
                          tipo: "servicio",
                          detalleId: detalle.id,
                          nombre: detalle.servicioNombre,
                        })
                      }
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!ocultarRepuestos && (
        <div className="panel">
          <div className="lineas__cabecera">
            <h3 className="panel__titulo">Repuestos</h3>
            <button
              type="button"
              className="boton-secundario"
              onClick={() => setLineaNueva("repuesto")}
            >
              + Agregar repuesto
            </button>
          </div>

          {orden.detallesRepuestos.length === 0 ? (
            <p className="panel__texto">Sin repuestos cargados.</p>
          ) : (
            <table className="tabla">
              <thead>
                <tr>
                  <th>Repuesto</th>
                  <th className="tabla__num">Cantidad</th>
                  <th className="tabla__num">Precio</th>
                  <th className="tabla__num">Subtotal</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {orden.detallesRepuestos.map((detalle) => (
                  <tr key={detalle.id}>
                    <td>{detalle.repuestoNombre}</td>
                    <td className="tabla__num">{detalle.cantidad}</td>
                    <td className="tabla__num">
                      {formatearMoneda(detalle.precio)}
                    </td>
                    <td className="tabla__num">
                      {formatearMoneda(detalle.subtotal)}
                    </td>
                    <td className="tabla__acciones">
                      <button
                        type="button"
                        className="accion-quitar"
                        title="Quitar repuesto"
                        onClick={() =>
                          setLineaAQuitar({
                            tipo: "repuesto",
                            detalleId: detalle.id,
                            nombre: detalle.repuestoNombre,
                          })
                        }
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="detalle__total">
        <span>Total de la orden</span>
        <strong>{formatearMoneda(orden.costo)}</strong>
      </div>

      {openEditar && (
        <ModalEditarOrden onCerrar={() => setOpenEditar(false)} />
      )}

      {estadoDestino && (
        <ModalCambioEstado
          destino={estadoDestino}
          onCerrar={() => setEstadoDestino(null)}
        />
      )}

      {lineaNueva && (
        <ModalAgregarLinea
          tipo={lineaNueva}
          onCerrar={() => setLineaNueva(null)}
        />
      )}

      {lineaAQuitar && (
        <Modal titulo="Quitar línea" onCerrar={() => setLineaAQuitar(null)}>
          <p>
            ¿Quitar <strong>{lineaAQuitar.nombre}</strong> de la orden? El total
            se recalcula automáticamente.
          </p>

          <div className="modal-acciones">
            <button
              type="button"
              className="boton-secundario"
              onClick={() => setLineaAQuitar(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="boton-peligro"
              onClick={confirmarQuitarLinea}
            >
              Quitar
            </button>
          </div>
        </Modal>
      )}

      {openEliminar && (
        <Modal
          titulo="Eliminar orden"
          onCerrar={() => setOpenEliminar(false)}
        >
          <p>
            ¿Eliminar la orden <strong>{orden.numeroOrden}</strong>? Se
            restaurará el stock de los repuestos usados y no se puede deshacer.
          </p>

          <div className="modal-acciones">
            <button
              type="button"
              className="boton-secundario"
              onClick={() => setOpenEliminar(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="boton-peligro"
              onClick={confirmarEliminacion}
            >
              Eliminar
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}

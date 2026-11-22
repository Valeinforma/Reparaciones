import { useMemo } from "react";
import { useOrdenContext } from "../OrdenContext/OrdenContext";
import type { EstadoOrden } from "../../Hooks/useOrdenesApi";
import Buscador from "../Buscador/Buscador";
import ChipsEstado from "../ChipsEstado/ChipsEstado";
import Orden from "../Orden/Orden";
import ModalAltaOrden from "../ModalAltaOrden/ModalAltaOrden";
import Modal from "../Modal/Modal";
import "./OrdenesList.css";

const CONTEO_INICIAL: Record<EstadoOrden, number> = {
  Recibido: 0,
  EnDiagnostico: 0,
  Presupuestado: 0,
  EnReparacion: 0,
  Listo: 0,
  Entregado: 0,
  Cancelado: 0,
};

export default function OrdenesList() {
  const {
    ordenes,
    cargando,
    error,
    obtenerOrdenes,
    busqueda,
    setBusqueda,
    filtro,
    setFiltro,
    openModal,
    setOpenModal,
    ordenAEliminar,
    setOrdenAEliminar,
    eliminarOrden,
  } = useOrdenContext();

  // Conteos sobre TODA la lista (los chips no dependen del buscador)
  const conteos = useMemo(() => {
    const resultado = { ...CONTEO_INICIAL };

    for (const orden of ordenes) {
      resultado[orden.estado] += 1;
    }

    return resultado;
  }, [ordenes]);

  const ordenesVisibles = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return ordenes.filter((orden) => {
      if (filtro !== "Todos" && orden.estado !== filtro) return false;

      if (!termino) return true;

      return [
        orden.numeroOrden,
        orden.clienteNombre,
        orden.equipoTipo,
        orden.equipoMarca,
        orden.equipoModelo,
        orden.equipoNumeroSerie,
      ]
        .filter((campo): campo is string => Boolean(campo))
        .some((campo) => campo.toLowerCase().includes(termino));
    });
  }, [ordenes, busqueda, filtro]);

  async function confirmarEliminacion() {
    if (!ordenAEliminar) return;

    try {
      await eliminarOrden(ordenAEliminar.id);
      setOrdenAEliminar(null);
    } catch {
      setOrdenAEliminar(null);
    }
  }

  return (
    <section className="ordenes">
      <div className="listado-barra">
        <Buscador
          valor={busqueda}
          onCambio={setBusqueda}
          placeholder="Buscar por número, cliente o número de serie…"
        />

        <button
          type="button"
          className="boton-primario"
          onClick={() => setOpenModal(true)}
        >
          + Nueva orden
        </button>
      </div>

      <ChipsEstado
        filtro={filtro}
        onFiltro={setFiltro}
        conteos={conteos}
        total={ordenes.length}
      />

      {error && ordenes.length > 0 && (
        <div className="aviso-error">
          <span>{error}</span>
          <button
            type="button"
            className="boton-secundario"
            onClick={() => obtenerOrdenes()}
          >
            Reintentar
          </button>
        </div>
      )}

      {cargando && ordenes.length === 0 && <p className="estado">Cargando…</p>}

      {!cargando && error && ordenes.length === 0 && (
        <div className="estado estado--error">
          <p>{error}</p>
          <button
            type="button"
            className="boton-secundario"
            onClick={() => obtenerOrdenes()}
          >
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && ordenesVisibles.length === 0 && (
        <p className="estado">
          {busqueda || filtro !== "Todos"
            ? "Ninguna orden coincide con el filtro."
            : "Todavía no hay órdenes cargadas."}
        </p>
      )}

      <div className="grilla">
        {ordenesVisibles.map((orden) => (
          <Orden
            key={orden.id}
            orden={orden}
            onEliminar={() => setOrdenAEliminar(orden)}
          />
        ))}
      </div>

      {openModal && <ModalAltaOrden onCerrar={() => setOpenModal(false)} />}

      {ordenAEliminar && (
        <Modal
          titulo="Eliminar orden"
          onCerrar={() => setOrdenAEliminar(null)}
        >
          <p>
            ¿Eliminar la orden <strong>{ordenAEliminar.numeroOrden}</strong> de{" "}
            <strong>{ordenAEliminar.clienteNombre}</strong>? Se restaurará el
            stock de los repuestos usados.
          </p>

          <div className="modal-acciones">
            <button
              type="button"
              className="boton-secundario"
              onClick={() => setOrdenAEliminar(null)}
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

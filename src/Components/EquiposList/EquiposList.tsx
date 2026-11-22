import { useMemo } from "react";
import { useEquipoContext } from "../EquipoContext/EquipoContext";
import Buscador from "../Buscador/Buscador";
import Equipo from "../Equipo/Equipo";
import AgregarEditarEquipo from "../AgregarEditarEquipo/AgregarEditarEquipo";
import Modal from "../Modal/Modal";
import "./EquiposList.css";

export default function EquiposList() {
  const {
    equipos,
    cargando,
    error,
    obtenerEquipos,
    busqueda,
    setBusqueda,
    openModal,
    setOpenModal,
    equipoSeleccionado,
    setEquipoSeleccionado,
    equipoAEliminar,
    setEquipoAEliminar,
    eliminarEquipo,
  } = useEquipoContext();

  // Filtro en memoria: tipo / marca / modelo / serie / cliente
  const equiposVisibles = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) return equipos;

    return equipos.filter((equipo) =>
      [
        equipo.tipo,
        equipo.marca,
        equipo.modelo,
        equipo.numeroSerie,
        equipo.clienteNombre,
      ]
        .filter((campo): campo is string => Boolean(campo))
        .some((campo) => campo.toLowerCase().includes(termino)),
    );
  }, [equipos, busqueda]);

  function abrirAlta() {
    setEquipoSeleccionado(null);
    setOpenModal(true);
  }

  function abrirEdicion(equipo: (typeof equipos)[number]) {
    setEquipoSeleccionado(equipo);
    setOpenModal(true);
  }

  async function confirmarEliminacion() {
    if (!equipoAEliminar) return;

    try {
      await eliminarEquipo(equipoAEliminar.id);
      setEquipoAEliminar(null);
    } catch {
      // El mensaje ya quedó en el estado `error` del hook
      setEquipoAEliminar(null);
    }
  }

  return (
    <section className="equipos">
      <div className="listado-barra">
        <Buscador
          valor={busqueda}
          onCambio={setBusqueda}
          placeholder="Buscar por tipo, marca, serie o cliente…"
        />

        <button type="button" className="boton-primario" onClick={abrirAlta}>
          + Nuevo equipo
        </button>
      </div>

      {error && equipos.length > 0 && (
        <div className="aviso-error">
          <span>{error}</span>
          <button
            type="button"
            className="boton-secundario"
            onClick={() => obtenerEquipos()}
          >
            Reintentar
          </button>
        </div>
      )}

      {cargando && equipos.length === 0 && <p className="estado">Cargando…</p>}

      {!cargando && error && equipos.length === 0 && (
        <div className="estado estado--error">
          <p>{error}</p>
          <button
            type="button"
            className="boton-secundario"
            onClick={() => obtenerEquipos()}
          >
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && equiposVisibles.length === 0 && (
        <p className="estado">
          {busqueda
            ? "Ningún equipo coincide con la búsqueda."
            : "Todavía no hay equipos cargados."}
        </p>
      )}

      <div className="grilla">
        {equiposVisibles.map((equipo) => (
          <Equipo
            key={equipo.id}
            equipo={equipo}
            onEditar={() => abrirEdicion(equipo)}
            onEliminar={() => setEquipoAEliminar(equipo)}
          />
        ))}
      </div>

      {openModal && (
        <AgregarEditarEquipo
          inicial={equipoSeleccionado}
          onCerrar={() => setOpenModal(false)}
        />
      )}

      {equipoAEliminar && (
        <Modal
          titulo="Eliminar equipo"
          onCerrar={() => setEquipoAEliminar(null)}
        >
          <p>
            ¿Eliminar el equipo{" "}
            <strong>
              {[equipoAEliminar.tipo, equipoAEliminar.marca, equipoAEliminar.modelo]
                .filter(Boolean)
                .join(" ") || `#${equipoAEliminar.id}`}
            </strong>
            ? Esta acción no se puede deshacer.
          </p>

          {error && <p className="form-equipo__error">{error}</p>}

          <div className="modal-acciones">
            <button
              type="button"
              className="boton-secundario"
              onClick={() => setEquipoAEliminar(null)}
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

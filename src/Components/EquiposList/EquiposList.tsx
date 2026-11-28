import { useMemo } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useEquipoContext } from "../EquipoContext/EquipoContext";
import Buscador from "../Buscador/Buscador";
import EstadoListado from "../EstadoListado/EstadoListado";
import Equipo from "../Equipo/Equipo";
import AgregarEditarEquipo from "../AgregarEditarEquipo/AgregarEditarEquipo";

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

  // null = alta, con equipo = edición
  function abrirModal(equipo: (typeof equipos)[number] | null) {
    setEquipoSeleccionado(equipo);
    setOpenModal(true);
  }

  return (
    <section>
      <div className="listado-barra">
        <Buscador
          valor={busqueda}
          onCambio={setBusqueda}
          placeholder="Buscar por tipo, marca, modelo, serie o cliente…"
        />

        <Button variant="contained" onClick={() => abrirModal(null)}>
          + Nuevo equipo
        </Button>
      </div>

      <EstadoListado
        cargando={cargando}
        error={error}
        total={equipos.length}
        visibles={equiposVisibles.length}
        mensajeVacio={busqueda ? "Ningún equipo coincide con la búsqueda." : "Todavía no hay equipos cargados."}
        onReintentar={() => obtenerEquipos()}
      />

      <Box className="grilla">
        {equiposVisibles.map((equipo) => (
          <Equipo
            key={equipo.id}
            equipo={equipo}
            onEditar={() => abrirModal(equipo)}
          />
        ))}
      </Box>

      {openModal && (
        <AgregarEditarEquipo
          inicial={equipoSeleccionado}
          onCerrar={() => setOpenModal(false)}
        />
      )}
    </section>
  );
}

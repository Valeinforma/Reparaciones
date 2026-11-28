import { useMemo } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEquipoContext } from "../EquipoContext/EquipoContext";
import Buscador from "../Buscador/Buscador";
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

  function abrirAlta() {
    setEquipoSeleccionado(null);
    setOpenModal(true);
  }

  function abrirEdicion(equipo: (typeof equipos)[number]) {
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

        <Button variant="contained" onClick={abrirAlta}>
          + Nuevo equipo
        </Button>
      </div>

      {error && equipos.length > 0 && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => obtenerEquipos()}
            >
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {cargando && equipos.length === 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {!cargando && error && equipos.length === 0 && (
        <Stack spacing={2} sx={{ alignItems: "center", py: 5 }}>
          <Alert severity="error">{error}</Alert>
          <Button variant="outlined" onClick={() => obtenerEquipos()}>
            Reintentar
          </Button>
        </Stack>
      )}

      {!cargando && !error && equiposVisibles.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
          {busqueda
            ? "Ningún equipo coincide con la búsqueda."
            : "Todavía no hay equipos cargados."}
        </Typography>
      )}

      <Box className="grilla">
        {equiposVisibles.map((equipo) => (
          <Equipo
            key={equipo.id}
            equipo={equipo}
            onEditar={() => abrirEdicion(equipo)}
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

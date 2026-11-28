import { useMemo } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useOrdenContext } from "../OrdenContext/OrdenContext";
import type { EstadoOrden } from "../../Hooks/useOrdenesApi";
import Buscador from "../Buscador/Buscador";
import ChipsEstado from "../ChipsEstado/ChipsEstado";
import Orden from "../Orden/Orden";
import ModalAltaOrden from "../ModalAltaOrden/ModalAltaOrden";

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

  return (
    <section>
      <div className="listado-barra">
        <Buscador
          valor={busqueda}
          onCambio={setBusqueda}
          placeholder="Buscar por número, cliente o número de serie…"
        />

        <Button variant="contained" onClick={() => setOpenModal(true)}>
          + Nueva orden
        </Button>
      </div>

      <ChipsEstado
        filtro={filtro}
        onFiltro={setFiltro}
        conteos={conteos}
        total={ordenes.length}
      />

      {error && ordenes.length > 0 && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => obtenerOrdenes()}
            >
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {cargando && ordenes.length === 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {!cargando && error && ordenes.length === 0 && (
        <Stack spacing={2} sx={{ alignItems: "center", py: 5 }}>
          <Alert severity="error">{error}</Alert>
          <Button variant="outlined" onClick={() => obtenerOrdenes()}>
            Reintentar
          </Button>
        </Stack>
      )}

      {!cargando && !error && ordenesVisibles.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
          {busqueda || filtro !== "Todos"
            ? "Ninguna orden coincide con el filtro."
            : "Todavía no hay órdenes cargadas."}
        </Typography>
      )}

      <Box className="grilla">
        {ordenesVisibles.map((orden) => (
          <Orden key={orden.id} orden={orden} />
        ))}
      </Box>

      {openModal && <ModalAltaOrden onCerrar={() => setOpenModal(false)} />}
    </section>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useOrdenDetalleContext } from "../OrdenDetalleContext/OrdenDetalleContext";
import { useSesion } from "../../Hooks/useSesion";
import EstadoBadge from "../EstadoBadge/EstadoBadge";
import EstadoStepper from "../EstadoStepper/EstadoStepper";
import ModalEditarOrden from "../ModalEditarOrden/ModalEditarOrden";
import ModalCambioEstado from "../ModalCambioEstado/ModalCambioEstado";
import ModalAgregarLinea from "../ModalAgregarLinea/ModalAgregarLinea";
import {
  describirEquipo,
  ETIQUETAS_ESTADO,
  formatearFecha,
  formatearFechaHora,
  formatearMoneda,
  TRANSICIONES,
} from "../../Hooks/useOrdenesApi";
import type { TipoLinea } from "../../Hooks/useOrdenDetalleApi";
import {
  avisoError,
  avisoExito,
  confirmar,
} from "../../utils/dialogos";
import { mensajeDeError } from "../../utils/api";

// Una línea de servicio o repuesto, ya normalizada para la vista.
interface LineaVista {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

interface ListaLineasProps {
  titulo: string;
  tipo: TipoLinea;
  lineas: LineaVista[];
  onAgregar: () => void;
  onQuitar: (tipo: TipoLinea, id: number, nombre: string) => void;
}

function ListaLineas({
  titulo,
  tipo,
  lineas,
  onAgregar,
  onQuitar,
}: ListaLineasProps) {
  return (
    <>
      <Stack
        direction="row"
        useFlexGap
        spacing={1}
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          mb: 1,
        }}
      >
        <Typography color="text.secondary">{titulo}</Typography>
        <Button size="small" variant="outlined" onClick={onAgregar}>
          + Agregar {tipo}
        </Button>
      </Stack>

      {lineas.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          Sin {tipo}s cargados.
        </Typography>
      ) : (
        <Stack divider={<Divider />}>
          {lineas.map((linea) => (
            <Stack
              key={linea.id}
              direction="row"
              sx={{ alignItems: "center", gap: 2, py: 1 }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 500 }}>
                  {linea.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {linea.cantidad} × {formatearMoneda(linea.precio)}
                </Typography>
              </Box>

              <Typography sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                {formatearMoneda(linea.subtotal)}
              </Typography>

              <IconButton
                size="small"
                color="error"
                aria-label={`Quitar ${linea.nombre}`}
                onClick={() => onQuitar(tipo, linea.id, linea.nombre)}
              >
                ✕
              </IconButton>
            </Stack>
          ))}
        </Stack>
      )}
    </>
  );
}

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
  } = useOrdenDetalleContext();

  const sesion = useSesion();
  const navigate = useNavigate();
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  if (cargando && !orden) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!orden) {
    return (
      <Stack spacing={2} sx={{ alignItems: "center", py: 6 }}>
        <Alert severity="error">{error ?? "La orden no existe."}</Alert>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => cargarOrden()}>
            Reintentar
          </Button>
          <Button variant="contained" component={Link} to="/ordenes">
            Volver al listado
          </Button>
        </Stack>
      </Stack>
    );
  }

  // El rol Recepcion no tiene acceso a /api/repuestos
  const ocultarRepuestos = sinPermisoRepuestos || sesion?.rol === "Recepcion";
  const transiciones = TRANSICIONES[orden.estado];

  // Se muestran solo las notas con contenido
  const notas = [
    { etiqueta: "Problema reportado", valor: orden.problemaReportado },
    { etiqueta: "Diagnóstico", valor: orden.diagnostico },
    { etiqueta: "Solución", valor: orden.solucion },
    { etiqueta: "Observaciones", valor: orden.observaciones },
  ].filter((nota): nota is { etiqueta: string; valor: string } =>
    Boolean(nota.valor),
  );

  const metadatos = [
    `Ingreso ${formatearFechaHora(orden.fechaIngreso)}`,
    orden.fechaEstimada
      ? `Entrega est. ${formatearFecha(orden.fechaEstimada)}`
      : "Entrega est. sin definir",
    `Responsable ${orden.usuarioNombre}`,
    orden.equipoNumeroSerie ? `S/N ${orden.equipoNumeroSerie}` : "",
  ].filter(Boolean);

  const servicios: LineaVista[] = orden.detallesServicios.map((d) => ({ ...d, nombre: d.servicioNombre }));
  const repuestos: LineaVista[] = orden.detallesRepuestos.map((d) => ({ ...d, nombre: d.repuestoNombre }));

  // Confirma, ejecuta la acción y muestra el resultado (o el error).
  async function confirmarYEjecutar(
    texto: string,
    textoBoton: string,
    accion: () => Promise<void>,
    exito: string,
  ) {
    if (!(await confirmar(texto, textoBoton))) return;
    setErrorAccion(null);
    try {
      await accion();
      avisoExito(exito);
    } catch (err) {
      const mensaje = mensajeDeError(err);
      setErrorAccion(mensaje);
      avisoError(mensaje);
    }
  }

  const pedirQuitar = (tipo: TipoLinea, detalleId: number, nombre: string) =>
    confirmarYEjecutar(
      `¿Quitar "${nombre}" de la orden? El total se recalcula automáticamente.`,
      "Sí, quitarlo",
      () => quitarLinea(tipo, detalleId),
      "Línea quitada",
    );

  const pedirEliminar = () =>
    confirmarYEjecutar(
      `¿Eliminar la orden ${orden.numeroOrden}? Se restaurará el stock de los repuestos usados y no se puede deshacer.`,
      "Sí, eliminarlo",
      async () => {
        await eliminarOrden();
        navigate("/ordenes", { replace: true });
      },
      "Orden eliminada",
    );

  return (
    <section>
      {/* 1. Encabezado */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Button component={Link} to="/ordenes" size="small" sx={{ mb: 1 }}>
            ← Volver a órdenes
          </Button>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Typography variant="h2">{orden.numeroOrden}</Typography>
            <EstadoBadge estado={orden.estado} />
          </Stack>

          <Typography sx={{ mt: 0.5 }}>
            {orden.clienteNombre} ·{" "}
            {describirEquipo(orden.equipoTipo, orden.equipoMarca, orden.equipoModelo)}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {metadatos.join(" · ")}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => setOpenEditar(true)}>
            Editar datos
          </Button>
          <Button variant="contained" color="error" onClick={pedirEliminar}>
            Eliminar
          </Button>
        </Stack>
      </Box>

      {errorAccion && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorAccion(null)}>
          {errorAccion}
        </Alert>
      )}

      {/* 2. Estado */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Estado
        </Typography>

        <EstadoStepper estado={orden.estado} />

        <Divider sx={{ my: 2 }} />

        {transiciones.length === 0 ? (
          <Typography color="text.secondary">
            La orden está en estado{" "}
            <strong>{ETIQUETAS_ESTADO[orden.estado]}</strong> y no admite más
            cambios.
          </Typography>
        ) : (
          <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: "wrap" }}>
            {transiciones.map((estado) => (
              <Button
                key={estado}
                variant="contained"
                color={estado === "Cancelado" ? "error" : "primary"}
                onClick={() => setEstadoDestino(estado)}
              >
                {estado === "Cancelado"
                  ? "Cancelar orden"
                  : `Pasar a ${ETIQUETAS_ESTADO[estado]}`}
              </Button>
            ))}
          </Stack>
        )}
      </Paper>

      {/* 3. Trabajo: servicios, repuestos y total */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
        <Typography variant="h3" sx={{ mb: 1 }}>
          Trabajo
        </Typography>

        <ListaLineas
          titulo="Servicios"
          tipo="servicio"
          lineas={servicios}
          onAgregar={() => setLineaNueva("servicio")}
          onQuitar={pedirQuitar}
        />

        {!ocultarRepuestos && (
          <>
            <Divider sx={{ my: 2 }} />
            <ListaLineas
              titulo="Repuestos"
              tipo="repuesto"
              lineas={repuestos}
              onAgregar={() => setLineaNueva("repuesto")}
              onQuitar={pedirQuitar}
            />
          </>
        )}

        <Divider sx={{ my: 2 }} />

        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "baseline" }}
        >
          <Typography variant="h3">Total</Typography>
          <Typography variant="h2" color="primary">
            {formatearMoneda(orden.costo)}
          </Typography>
        </Stack>
      </Paper>

      {/* 4. Notas (colapsadas) */}
      <Accordion
        disabled={notas.length === 0}
        disableGutters
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          "&::before": { display: "none" },
        }}
      >
        <AccordionSummary expandIcon={<span aria-hidden>▾</span>}>
          <Typography sx={{ fontWeight: 600 }}>
            {notas.length > 0
              ? `Notas de la orden (${notas.length})`
              : "Sin notas"}
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Stack spacing={2}>
            {notas.map((nota) => (
              <Box key={nota.etiqueta}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textTransform: "uppercase", letterSpacing: "0.5px" }}
                >
                  {nota.etiqueta}
                </Typography>
                <Typography>{nota.valor}</Typography>
              </Box>
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>

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
    </section>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Modal from "../Modal/Modal";
import { useOrdenContext } from "../OrdenContext/OrdenContext";
import { useClienteContext } from "../ClienteContext/ClienteContext";
import { useSesion } from "../../Hooks/useSesion";
import type { IEquipo } from "../../Hooks/useEquiposApi";
import { describirEquipo, type IOrdenInput } from "../../Hooks/useOrdenesApi";
import { avisoExito } from "../../utils/dialogos";
import { pedirApi, mensajeDeError } from "../../utils/api";

interface ModalAltaOrdenProps {
  onCerrar: () => void;
}

export default function ModalAltaOrden({ onCerrar }: ModalAltaOrdenProps) {
  const { agregarOrden } = useOrdenContext();
  const { clientes } = useClienteContext();
  const sesion = useSesion();
  const navigate = useNavigate();

  const [clienteId, setClienteId] = useState(0);
  const [equipoId, setEquipoId] = useState(0);
  const [equipos, setEquipos] = useState<IEquipo[] | null>(null);
  const [cargandoEquipos, setCargandoEquipos] = useState(false);
  const [errorEquipos, setErrorEquipos] = useState<string | null>(null);

  const [fechaEstimada, setFechaEstimada] = useState("");
  const [problemaReportado, setProblemaReportado] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEquipoId(0);
    setErrorEquipos(null);

    if (!clienteId) {
      setEquipos(null);
      return;
    }

    // "vivo" evita guardar la respuesta si el cliente cambió antes de que llegue
    let vivo = true;
    setCargandoEquipos(true);
    pedirApi<IEquipo[]>(`/api/equipos?clienteId=${clienteId}`, "Error al obtener los equipos")
      .then((datos) => vivo && setEquipos(datos))
      .catch((err) => vivo && setErrorEquipos(mensajeDeError(err)))
      .finally(() => vivo && setCargandoEquipos(false));

    return () => {
      vivo = false;
    };
  }, [clienteId]);

  async function alGuardar(e: React.FormEvent) {
    e.preventDefault();

    if (guardando) return;

    if (!clienteId) {
      setError("Seleccioná un cliente.");
      return;
    }

    if (!equipoId) {
      setError("Seleccioná el equipo que ingresa.");
      return;
    }

    if (!sesion) {
      setError("La sesión no es válida. Volvé a iniciar sesión.");
      return;
    }

    const datos: IOrdenInput = {
      equipoId,
      usuarioId: sesion.id,
      fechaEstimada: fechaEstimada || null,
      problemaReportado: problemaReportado.trim() || null,
      observaciones: observaciones.trim() || null,
    };

    setGuardando(true);
    setError(null);

    try {
      const nueva = await agregarOrden(datos);
      avisoExito("Orden creada");
      onCerrar();

      // Directo al detalle de la orden recién creada
      if (nueva) navigate(`/ordenes/${nueva.id}`);
    } catch (err) {
      setError(mensajeDeError(err));
      setGuardando(false);
    }
  }

  return (
    <Modal titulo="Nueva orden de servicio" onCerrar={onCerrar} ancho="ancho">
      <form onSubmit={alGuardar}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              select
              fullWidth
              label="Cliente *"
              value={clienteId}
              onChange={(e) => setClienteId(Number(e.target.value))}
              autoFocus
            >
              <MenuItem value={0}>Seleccioná un cliente…</MenuItem>
              {clientes.map((cliente) => (
                <MenuItem key={cliente.id} value={cliente.id}>
                  {cliente.nombre} {cliente.apellido}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Equipo *"
              value={equipoId}
              onChange={(e) => setEquipoId(Number(e.target.value))}
              disabled={!clienteId || cargandoEquipos}
            >
              <MenuItem value={0}>
                {!clienteId
                  ? "Elegí primero un cliente"
                  : cargandoEquipos
                    ? "Cargando equipos…"
                    : "Seleccioná un equipo…"}
              </MenuItem>
              {equipos?.map((equipo) => (
                <MenuItem key={equipo.id} value={equipo.id}>
                  {describirEquipo(equipo.tipo, equipo.marca, equipo.modelo)}
                  {equipo.numeroSerie ? ` · S/N ${equipo.numeroSerie}` : ""}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {errorEquipos && <Alert severity="error">{errorEquipos}</Alert>}

          {clienteId > 0 && !cargandoEquipos && equipos?.length === 0 && (
            <Alert severity="warning">
              Este cliente no tiene equipos cargados. Creá el equipo desde la
              sección Equipos y volvé a intentar.
            </Alert>
          )}

          <TextField
            fullWidth
            type="date"
            label="Fecha estimada de entrega"
            value={fechaEstimada}
            onChange={(e) => setFechaEstimada(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Problema reportado"
            placeholder="Qué informa el cliente: falla, ruidos, no enciende…"
            value={problemaReportado}
            onChange={(e) => setProblemaReportado(e.target.value)}
          />

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Observaciones"
            placeholder="Accesorios recibidos, estado estético, etc."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />

          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={onCerrar}
              disabled={guardando}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={guardando}>
              {guardando ? "Creando…" : "Crear orden"}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Modal>
  );
}

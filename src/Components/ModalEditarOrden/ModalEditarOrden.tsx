import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Modal from "../Modal/Modal";
import { useOrdenDetalleContext } from "../OrdenDetalleContext/OrdenDetalleContext";
import { paraInputFecha } from "../../Hooks/useOrdenesApi";
import { avisoExito } from "../../utils/dialogos";
import { mensajeDeError } from "../../utils/api";

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
      avisoExito("Orden actualizada");
      onCerrar();
    } catch (err) {
      setError(mensajeDeError(err));
      setGuardando(false);
    }
  }

  return (
    <Modal titulo="Editar orden" onCerrar={onCerrar}>
      <form onSubmit={alGuardar}>
        <Stack spacing={2}>
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
            value={problemaReportado}
            onChange={(e) => setProblemaReportado(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 1000 } }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 2000 } }}
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
              {guardando ? "Guardando…" : "Guardar cambios"}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Modal>
  );
}

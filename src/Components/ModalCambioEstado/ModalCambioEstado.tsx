import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Modal from "../Modal/Modal";
import { useOrdenDetalleContext } from "../OrdenDetalleContext/OrdenDetalleContext";
import {
  ETIQUETAS_ESTADO,
  type EstadoOrden,
} from "../../Hooks/useOrdenesApi";
import { avisoExito } from "../../utils/dialogos";

interface ModalCambioEstadoProps {
  destino: EstadoOrden;
  onCerrar: () => void;
}

function etiquetaNota(destino: EstadoOrden): string {
  if (destino === "EnDiagnostico") return "Diagnóstico";
  if (destino === "Listo") return "Solución aplicada";
  if (destino === "Cancelado") return "Motivo de la cancelación";
  return "Nota / observación";
}

export default function ModalCambioEstado({
  destino,
  onCerrar,
}: ModalCambioEstadoProps) {
  const { cambiarEstado } = useOrdenDetalleContext();

  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();

    if (guardando) return;

    setGuardando(true);
    setError(null);

    try {
      await cambiarEstado(destino, nota);
      avisoExito(`Orden en estado ${ETIQUETAS_ESTADO[destino]}`);
      onCerrar();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "No se pudo cambiar el estado.",
      );
      setGuardando(false);
    }
  }

  return (
    <Modal
      titulo={`Pasar a ${ETIQUETAS_ESTADO[destino]}`}
      onCerrar={onCerrar}
    >
      <form onSubmit={confirmar}>
        <Stack spacing={2}>
          <Typography color="text.secondary">
            La orden va a quedar en estado{" "}
            <strong>{ETIQUETAS_ESTADO[destino]}</strong>. La nota es opcional.
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            label={etiquetaNota(destino)}
            placeholder={
              destino === "EnDiagnostico"
                ? "Qué se detectó al revisar el equipo…"
                : destino === "Listo"
                  ? "Qué se hizo para resolver la falla…"
                  : "Detalle adicional…"
            }
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 2000 } }}
            autoFocus
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
            <Button
              type="submit"
              variant="contained"
              color={destino === "Cancelado" ? "error" : "primary"}
              disabled={guardando}
            >
              {guardando
                ? "Guardando…"
                : destino === "Cancelado"
                  ? "Cancelar orden"
                  : `Confirmar ${ETIQUETAS_ESTADO[destino]}`}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Modal>
  );
}

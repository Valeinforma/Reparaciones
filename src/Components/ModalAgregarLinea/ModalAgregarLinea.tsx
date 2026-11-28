import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Modal from "../Modal/Modal";
import { useOrdenDetalleContext } from "../OrdenDetalleContext/OrdenDetalleContext";
import { formatearMoneda } from "../../Hooks/useOrdenesApi";
import type { TipoLinea } from "../../Hooks/useOrdenDetalleApi";
import { avisoExito } from "../../utils/dialogos";
import { mensajeDeError } from "../../utils/api";

interface ModalAgregarLineaProps {
  tipo: TipoLinea;
  onCerrar: () => void;
}

export default function ModalAgregarLinea({
  tipo,
  onCerrar,
}: ModalAgregarLineaProps) {
  const { servicios, repuestos, orden, agregarLinea } =
    useOrdenDetalleContext();

  const [itemId, setItemId] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esServicio = tipo === "servicio";
  const titulo = esServicio ? "Agregar servicio" : "Agregar repuesto";

  const servicioElegido = servicios.find((servicio) => servicio.id === itemId);
  const repuestoElegido = repuestos.find((repuesto) => repuesto.id === itemId);

  const precio = esServicio
    ? (servicioElegido?.precio ?? 0)
    : (repuestoElegido?.precio ?? 0);

  const stock = esServicio ? null : (repuestoElegido?.stock ?? 0);

  const yaAgregado = esServicio
    ? (orden?.detallesServicios.find(
        (detalle) => detalle.servicioId === itemId,
      )?.cantidad ?? 0)
    : (orden?.detallesRepuestos.find(
        (detalle) => detalle.repuestoId === itemId,
      )?.cantidad ?? 0);

  const sinCatalogo = esServicio
    ? servicios.length === 0
    : repuestos.length === 0;

  async function alGuardar(e: React.FormEvent) {
    e.preventDefault();

    if (guardando) return;

    if (!itemId) {
      setError(esServicio ? "Elegí un servicio." : "Elegí un repuesto.");
      return;
    }

    if (!Number.isInteger(cantidad) || cantidad < 1) {
      setError("La cantidad debe ser un número entero mayor o igual a 1.");
      return;
    }

    if (stock !== null && cantidad > stock) {
      setError(`Stock insuficiente: quedan ${stock} unidades.`);
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      await agregarLinea(tipo, itemId, cantidad);
      avisoExito(esServicio ? "Servicio agregado" : "Repuesto agregado");
      onCerrar();
    } catch (err) {
      setError(mensajeDeError(err));
      setGuardando(false);
    }
  }

  return (
    <Modal titulo={titulo} onCerrar={onCerrar}>
      {sinCatalogo ? (
        <Stack spacing={2}>
          <Typography color="text.secondary">
            No hay {esServicio ? "servicios" : "repuestos"} activos
            disponibles.
          </Typography>
          <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
            <Button variant="outlined" onClick={onCerrar}>
              Cerrar
            </Button>
          </Stack>
        </Stack>
      ) : (
        <form onSubmit={alGuardar}>
          <Stack spacing={2}>
            <TextField
              select
              fullWidth
              label={esServicio ? "Servicio" : "Repuesto"}
              value={itemId}
              onChange={(e) => setItemId(Number(e.target.value))}
              autoFocus
            >
              <MenuItem value={0}>Seleccioná una opción…</MenuItem>
              {esServicio
                ? servicios.map((servicio) => (
                    <MenuItem key={servicio.id} value={servicio.id}>
                      {servicio.nombre} — {formatearMoneda(servicio.precio)}
                    </MenuItem>
                  ))
                : repuestos.map((repuesto) => (
                    <MenuItem key={repuesto.id} value={repuesto.id}>
                      {repuesto.nombre} — {formatearMoneda(repuesto.precio)}{" "}
                      (stock {repuesto.stock})
                    </MenuItem>
                  ))}
            </TextField>

            <TextField
              fullWidth
              type="number"
              label="Cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              slotProps={{ htmlInput: { min: 1, step: 1 } }}
            />

            {itemId > 0 && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Precio unitario:{" "}
                    <strong>{formatearMoneda(precio)}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal:{" "}
                    <strong>{formatearMoneda(precio * cantidad)}</strong>
                  </Typography>
                  {stock !== null && (
                    <Typography variant="body2" color="text.secondary">
                      Stock disponible: <strong>{stock}</strong>
                    </Typography>
                  )}
                  {yaAgregado > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Ya en la orden: <strong>{yaAgregado}</strong>
                    </Typography>
                  )}
                </Stack>
              </Paper>
            )}

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
                {guardando ? "Agregando…" : "Agregar"}
              </Button>
            </Stack>
          </Stack>
        </form>
      )}
    </Modal>
  );
}

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Modal from "../Modal/Modal";
import { useEquipoContext } from "../EquipoContext/EquipoContext";
import { useClienteContext } from "../ClienteContext/ClienteContext";
import type { IEquipo, IEquipoInput } from "../../Hooks/useEquiposApi";
import { avisoExito } from "../../utils/dialogos";
import { mensajeDeError } from "../../utils/api";

interface AgregarEditarEquipoProps {
  inicial: IEquipo | null; // null = alta
  onCerrar: () => void;
}

export default function AgregarEditarEquipo({
  inicial,
  onCerrar,
}: AgregarEditarEquipoProps) {
  const { agregarEquipo, editarEquipo } = useEquipoContext();
  const { clientes } = useClienteContext();

  const [clienteId, setClienteId] = useState<number>(inicial?.clienteId ?? 0);
  const [tipo, setTipo] = useState(inicial?.tipo ?? "");
  const [marca, setMarca] = useState(inicial?.marca ?? "");
  const [modelo, setModelo] = useState(inicial?.modelo ?? "");
  const [numeroSerie, setNumeroSerie] = useState(inicial?.numeroSerie ?? "");
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function alGuardar(e: React.FormEvent) {
    e.preventDefault();

    if (guardando) return;

    if (!clienteId) {
      setError("Seleccioná un cliente.");
      return;
    }

    const datos: IEquipoInput = {
      clienteId,
      tipo: tipo.trim() || null,
      marca: marca.trim() || null,
      modelo: modelo.trim() || null,
      numeroSerie: numeroSerie.trim() || null,
      descripcion: descripcion.trim() || null,
    };

    setGuardando(true);
    setError(null);

    try {
      if (inicial) {
        await editarEquipo(inicial.id, datos);
        avisoExito("Equipo actualizado");
      } else {
        await agregarEquipo(datos);
        avisoExito("Equipo creado");
      }
      onCerrar();
    } catch (err) {
      setError(mensajeDeError(err));
      setGuardando(false);
    }
  }

  return (
    <Modal
      titulo={inicial ? "Editar equipo" : "Nuevo equipo"}
      onCerrar={onCerrar}
    >
      <form onSubmit={alGuardar}>
        <Stack spacing={2}>
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

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              label="Tipo"
              placeholder="Notebook, PC, Impresora…"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            />
            <TextField
              fullWidth
              label="Marca"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              label="Modelo"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
            />
            <TextField
              fullWidth
              label="Número de serie"
              value={numeroSerie}
              onChange={(e) => setNumeroSerie(e.target.value)}
            />
          </Stack>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Descripción"
            placeholder="Detalles del equipo, accesorios, estado…"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
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
              {guardando
                ? "Guardando…"
                : inicial
                  ? "Guardar cambios"
                  : "Crear equipo"}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Modal>
  );
}

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Modal from "../Modal/Modal";
import { useClienteContext } from "../ClienteContext/ClienteContext";
import type ICliente from "../../Interfaces/ICliente";
import { avisoExito } from "../../utils/dialogos";
import { mensajeDeError } from "../../utils/api";

interface AgregarEditarClienteProps {
  inicial: ICliente | null; // null = alta
  onCerrar: () => void;
}

export default function AgregarEditarCliente({
  inicial,
  onCerrar,
}: AgregarEditarClienteProps) {
  const { agregarCliente, editarCliente } = useClienteContext();

  const [nombre, setNombre] = useState(inicial?.nombre ?? "");
  const [apellido, setApellido] = useState(inicial?.apellido ?? "");
  const [telefono, setTelefono] = useState(inicial?.telefono ?? "");
  const [email, setEmail] = useState(inicial?.email ?? "");
  const [direccion, setDireccion] = useState(inicial?.direccion ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function alGuardar(e: React.FormEvent) {
    e.preventDefault();

    if (guardando) return;

    if (!nombre.trim() || !apellido.trim()) {
      setError("Nombre y apellido son obligatorios.");
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("El email no tiene un formato válido.");
      return;
    }

    // Campos vacíos → null (el DTO del backend los acepta así)
    const datos = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      telefono: telefono.trim() || null,
      email: email.trim() || null,
      direccion: direccion.trim() || null,
    };

    setGuardando(true);
    setError(null);

    try {
      if (inicial) {
        await editarCliente(inicial.id, datos);
        avisoExito("Cliente actualizado");
      } else {
        await agregarCliente(datos);
        avisoExito("Cliente creado");
      }
      onCerrar();
    } catch (err) {
      setError(mensajeDeError(err));
      setGuardando(false);
    }
  }

  return (
    <Modal
      titulo={inicial ? "Editar cliente" : "Nuevo cliente"}
      onCerrar={onCerrar}
    >
      <form onSubmit={alGuardar}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              label="Nombre *"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoFocus
            />
            <TextField
              fullWidth
              label="Apellido *"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
            />
          </Stack>

          <TextField
            fullWidth
            label="Teléfono"
            placeholder="11 5555-5555"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            placeholder="cliente@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            fullWidth
            label="Dirección"
            placeholder="Calle y número"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
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
                  : "Crear cliente"}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Modal>
  );
}

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type ICliente from "../../Interfaces/ICliente";
import { useClienteContext } from "../ClienteContext/ClienteContext";
import {
  avisoError,
  avisoExito,
  confirmarEliminacion,
} from "../../utils/dialogos";

interface ClienteProps {
  cliente: ICliente;
  onEditar: () => void;
  onVerEquipos: () => void;
}

export default function Cliente({
  cliente,
  onEditar,
  onVerEquipos,
}: ClienteProps) {
  const { eliminarCliente } = useClienteContext();

  async function onEliminar() {
    const confirmado = await confirmarEliminacion(
      `¿Eliminar a ${cliente.nombre} ${cliente.apellido}? Esta acción no se puede deshacer.`,
    );

    if (!confirmado) return;

    try {
      await eliminarCliente(cliente.id);
      avisoExito("Cliente eliminado");
    } catch (err: unknown) {
      avisoError(
        err instanceof Error ? err.message : "No se pudo eliminar el cliente.",
      );
    }
  }

  return (
    <Card sx={{ display: "flex", flexDirection: "column" }}>
      <CardHeader
        title={`${cliente.nombre} ${cliente.apellido}`}
        subheader={cliente.direccion ?? "Sin dirección"}
      />

      <CardContent sx={{ flexGrow: 1, pt: 0 }}>
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            {cliente.email ?? "Sin email"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {cliente.telefono ?? "Sin teléfono"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {cliente.totalEquipos}{" "}
            {cliente.totalEquipos === 1 ? "equipo" : "equipos"}
          </Typography>
        </Stack>
      </CardContent>

      <CardActions sx={{ justifyContent: "center", flexWrap: "wrap", gap: 1 }}>
        <Button size="small" variant="outlined" onClick={onVerEquipos}>
          Equipos
        </Button>
        <Button size="small" variant="contained" onClick={onEditar}>
          Editar
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={onEliminar}
        >
          Eliminar
        </Button>
      </CardActions>
    </Card>
  );
}

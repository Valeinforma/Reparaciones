import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import EstadoBadge from "../EstadoBadge/EstadoBadge";
import type { IEquipo } from "../../Hooks/useEquiposApi";
import { useEquipoContext } from "../EquipoContext/EquipoContext";
import {
  avisoError,
  avisoExito,
  confirmarEliminacion,
} from "../../utils/dialogos";

interface EquipoProps {
  equipo: IEquipo;
  onEditar: () => void;
}

export default function Equipo({ equipo, onEditar }: EquipoProps) {
  const { eliminarEquipo } = useEquipoContext();

  const nombre =
    [equipo.tipo, equipo.marca, equipo.modelo].filter(Boolean).join(" ") ||
    `Equipo #${equipo.id}`;

  async function onEliminar() {
    const confirmado = await confirmarEliminacion(
      `¿Eliminar el equipo "${nombre}"? Esta acción no se puede deshacer.`,
    );

    if (!confirmado) return;

    try {
      await eliminarEquipo(equipo.id);
      avisoExito("Equipo eliminado");
    } catch (err: unknown) {
      avisoError(
        err instanceof Error ? err.message : "No se pudo eliminar el equipo.",
      );
    }
  }

  return (
    <Card sx={{ display: "flex", flexDirection: "column" }}>
      <CardHeader
        title={nombre}
        subheader={equipo.clienteNombre}
        action={equipo.ordenEstado && <EstadoBadge estado={equipo.ordenEstado} />}
      />

      <CardContent sx={{ flexGrow: 1, pt: 0 }}>
        <Stack spacing={0.5}>
          {equipo.numeroSerie && (
            <Typography variant="body2" color="text.secondary">
              S/N {equipo.numeroSerie}
            </Typography>
          )}
          {equipo.descripcion && (
            <Typography variant="body2" color="text.secondary">
              {equipo.descripcion}
            </Typography>
          )}
          {!equipo.numeroSerie && !equipo.descripcion && (
            <Typography variant="body2" color="text.secondary">
              Sin datos adicionales.
            </Typography>
          )}
        </Stack>
      </CardContent>

      <CardActions sx={{ justifyContent: "center", flexWrap: "wrap", gap: 1 }}>
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

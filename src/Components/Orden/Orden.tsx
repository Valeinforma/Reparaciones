import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import EstadoBadge from "../EstadoBadge/EstadoBadge";
import { useOrdenContext } from "../OrdenContext/OrdenContext";
import {
  describirEquipo,
  formatearFecha,
  formatearMoneda,
  type IOrden,
} from "../../Hooks/useOrdenesApi";
import {
  avisoError,
  avisoExito,
  confirmarEliminacion,
} from "../../utils/dialogos";

interface OrdenProps {
  orden: IOrden;
}

export default function Orden({ orden }: OrdenProps) {
  const { eliminarOrden } = useOrdenContext();

  async function onEliminar() {
    const confirmado = await confirmarEliminacion(
      `¿Eliminar la orden ${orden.numeroOrden}? Se restaurará el stock de los repuestos usados y no se puede deshacer.`,
    );

    if (!confirmado) return;

    try {
      await eliminarOrden(orden.id);
      avisoExito("Orden eliminada");
    } catch (err: unknown) {
      avisoError(
        err instanceof Error ? err.message : "No se pudo eliminar la orden.",
      );
    }
  }

  return (
    <Card sx={{ display: "flex", flexDirection: "column" }}>
      <CardHeader
        title={
          <Link
            to={`/ordenes/${orden.id}`}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {orden.numeroOrden}
          </Link>
        }
        subheader={orden.clienteNombre}
        action={<EstadoBadge estado={orden.estado} />}
      />

      <CardContent sx={{ flexGrow: 1, pt: 0 }}>
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            {describirEquipo(
              orden.equipoTipo,
              orden.equipoMarca,
              orden.equipoModelo,
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ingreso: {formatearFecha(orden.fechaIngreso)}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>
            {formatearMoneda(orden.costo)}
          </Typography>
        </Stack>
      </CardContent>

      <CardActions sx={{ justifyContent: "center", flexWrap: "wrap", gap: 1 }}>
        <Button
          size="small"
          variant="contained"
          component={Link}
          to={`/ordenes/${orden.id}`}
        >
          Ver detalle
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

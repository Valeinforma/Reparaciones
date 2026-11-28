import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import {
  ETIQUETAS_ESTADO,
  type EstadoOrden,
  type FiltroEstado,
} from "../../Hooks/useOrdenesApi";

const ORDEN_CHIPS: FiltroEstado[] = [
  "Todos",
  "Recibido",
  "EnDiagnostico",
  "Presupuestado",
  "EnReparacion",
  "Listo",
  "Entregado",
  "Cancelado",
];

interface ChipsEstadoProps {
  filtro: FiltroEstado;
  onFiltro: (filtro: FiltroEstado) => void;
  conteos: Record<EstadoOrden, number>;
  total: number;
}

export default function ChipsEstado({
  filtro,
  onFiltro,
  conteos,
  total,
}: ChipsEstadoProps) {
  return (
    <Stack
      direction="row"
      useFlexGap
      spacing={1}
      sx={{ flexWrap: "wrap", mb: 2.5 }}
    >
      {ORDEN_CHIPS.map((chip) => {
        const cantidad = chip === "Todos" ? total : conteos[chip];
        const activo = filtro === chip;
        const etiqueta = chip === "Todos" ? "Todos" : ETIQUETAS_ESTADO[chip];

        return (
          <Chip
            key={chip}
            clickable
            label={`${etiqueta} · ${cantidad}`}
            color={activo ? "primary" : "default"}
            variant={activo ? "filled" : "outlined"}
            onClick={() => onFiltro(chip)}
          />
        );
      })}
    </Stack>
  );
}

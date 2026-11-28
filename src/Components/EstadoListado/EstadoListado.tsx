import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface EstadoListadoProps {
  cargando: boolean;
  error: string | null;
  total: number; // elementos cargados
  visibles: number; // elementos que pasan la búsqueda/filtro
  mensajeVacio: string;
  onReintentar: () => void;
}

// Muestra lo que corresponde arriba de una grilla: spinner,
// error (con botón Reintentar) o el mensaje de lista vacía.
export default function EstadoListado({
  cargando,
  error,
  total,
  visibles,
  mensajeVacio,
  onReintentar,
}: EstadoListadoProps) {
  const botonReintentar = (
    <Button color="inherit" size="small" onClick={onReintentar}>
      Reintentar
    </Button>
  );

  if (cargando && total === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && total > 0) {
    return (
      <Alert severity="error" sx={{ mb: 2 }} action={botonReintentar}>
        {error}
      </Alert>
    );
  }

  if (error) {
    return (
      <Stack spacing={2} sx={{ alignItems: "center", py: 5 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" onClick={onReintentar}>
          Reintentar
        </Button>
      </Stack>
    );
  }

  if (!cargando && visibles === 0) {
    return (
      <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
        {mensajeVacio}
      </Typography>
    );
  }

  return null;
}

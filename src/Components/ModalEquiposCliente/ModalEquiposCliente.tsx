import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Modal from "../Modal/Modal";
import EstadoBadge from "../EstadoBadge/EstadoBadge";
import type ICliente from "../../Interfaces/ICliente";
import type { IEquipo } from "../../Hooks/useEquiposApi";
import { pedirApi, mensajeDeError } from "../../utils/api";

interface ModalEquiposClienteProps {
  cliente: ICliente;
  onCerrar: () => void;
}

export default function ModalEquiposCliente({
  cliente,
  onCerrar,
}: ModalEquiposClienteProps) {
  const [equipos, setEquipos] = useState<IEquipo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    pedirApi<IEquipo[]>(`/api/equipos?clienteId=${cliente.id}`, "Error al obtener los equipos")
      .then((datos) => vivo && setEquipos(datos))
      .catch((err) => vivo && setError(mensajeDeError(err)));

    return () => {
      vivo = false;
    };
  }, [cliente.id]);

  return (
    <Modal
      titulo={`Equipos de ${cliente.nombre} ${cliente.apellido}`}
      onCerrar={onCerrar}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {equipos === null && !error && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {equipos?.length === 0 && (
        <Typography color="text.secondary">
          Este cliente no tiene equipos cargados.
        </Typography>
      )}

      <Stack spacing={1.5}>
        {equipos?.map((equipo) => (
          <Paper key={equipo.id} variant="outlined" sx={{ p: 1.5 }}>
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }}>
                  {[equipo.tipo, equipo.marca, equipo.modelo]
                    .filter(Boolean)
                    .join(" ") || `Equipo #${equipo.id}`}
                </Typography>
                {equipo.numeroSerie && (
                  <Typography variant="body2" color="text.secondary">
                    S/N {equipo.numeroSerie}
                  </Typography>
                )}
              </Box>

              {equipo.ordenEstado && (
                <EstadoBadge estado={equipo.ordenEstado} />
              )}
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Modal>
  );
}

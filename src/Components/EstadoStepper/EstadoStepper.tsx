import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import {
  FLUJO_ESTADOS,
  ETIQUETAS_ESTADO,
  type EstadoOrden,
} from "../../Hooks/useOrdenesApi";

export default function EstadoStepper({ estado }: { estado: EstadoOrden }) {
  if (estado === "Cancelado") {
    return <Alert severity="error">Orden cancelada</Alert>;
  }

  const actual = FLUJO_ESTADOS.indexOf(estado);

  return (
    <Box sx={{ width: "100%", overflowX: "auto", py: 1 }}>
      <Stepper activeStep={actual} alternativeLabel>
        {FLUJO_ESTADOS.map((paso) => (
          <Step key={paso}>
            <StepLabel>{ETIQUETAS_ESTADO[paso]}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}

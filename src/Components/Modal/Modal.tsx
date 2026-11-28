import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import "./Modal.css";

interface ModalProps {
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
  ancho?: "normal" | "ancho";
}

// Portal a <div id="modal">, igual que el repo.
export default function Modal({
  titulo,
  onCerrar,
  children,
  ancho = "normal",
}: ModalProps) {
  const destino = document.getElementById("modal");

  if (!destino) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onCerrar}>
      <Card
        className={`modal-caja${ancho === "ancho" ? " modal-caja--ancha" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-cabecera">
          <Typography variant="h6" component="h2">
            {titulo}
          </Typography>
          <IconButton size="small" onClick={onCerrar} aria-label="Cerrar">
            ✕
          </IconButton>
        </div>

        <CardContent sx={{ pt: 1.5 }}>{children}</CardContent>
      </Card>
    </div>,
    destino,
  );
}

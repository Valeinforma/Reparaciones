import type { ReactNode } from "react";
import "./Modal.css";


interface ModalProps {
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
  ancho?: "normal" | "ancho";
}

export default function Modal({
  titulo,
  onCerrar,
  children,
  ancho = "normal",
}: ModalProps) {
  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div
        className={`modal-caja${ancho === "ancho" ? " modal-caja--ancha" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-cabecera">
          <h2>{titulo}</h2>
          <button
            type="button"
            className="modal-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

import Swal from "sweetalert2";
import type { SweetAlertOptions } from "sweetalert2";

// Configuración de SweetAlert2 con la paleta oscura del proyecto.
const ESTILO_OSCURO = {
  background: "#1e293b",
  color: "#e2e8f0",
};

const BASE_CONFIRMAR: SweetAlertOptions = {
  title: "¿Estás seguro?",
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  cancelButtonText: "Cancelar",
  ...ESTILO_OSCURO,
};

export async function confirmarEliminacion(texto: string): Promise<boolean> {
  const resultado = await Swal.fire({
    ...BASE_CONFIRMAR,
    text: texto,
    confirmButtonText: "Sí, eliminarlo",
  });

  return resultado.isConfirmed;
}

export async function confirmarQuitar(texto: string): Promise<boolean> {
  const resultado = await Swal.fire({
    ...BASE_CONFIRMAR,
    text: texto,
    confirmButtonText: "Sí, quitarlo",
  });

  return resultado.isConfirmed;
}

export function avisoExito(titulo: string): void {
  void Swal.fire({
    icon: "success",
    title: titulo,
    timer: 1500,
    showConfirmButton: false,
    ...ESTILO_OSCURO,
  });
}

export function avisoError(texto: string): void {
  void Swal.fire({
    icon: "error",
    title: "Ocurrió un error",
    text: texto,
    confirmButtonColor: "#3085d6",
    ...ESTILO_OSCURO,
  });
}

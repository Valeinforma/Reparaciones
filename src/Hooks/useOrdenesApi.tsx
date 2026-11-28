
import { useState, useEffect, useCallback } from "react";
import { pedirApi } from "../utils/api";
import useCarga from "./useCarga";

export type EstadoOrden =
  | "Recibido"
  | "EnDiagnostico"
  | "Presupuestado"
  | "EnReparacion"
  | "Listo"
  | "Entregado"
  | "Cancelado";

export type FiltroEstado = EstadoOrden | "Todos";

export const FLUJO_ESTADOS: EstadoOrden[] = [
  "Recibido",
  "EnDiagnostico",
  "Presupuestado",
  "EnReparacion",
  "Listo",
  "Entregado",
];

export const ETIQUETAS_ESTADO: Record<EstadoOrden, string> = {
  Recibido: "Recibido",
  EnDiagnostico: "Diagnóstico",
  Presupuestado: "Presupuesto",
  EnReparacion: "Reparación",
  Listo: "Listo",
  Entregado: "Entregado",
  Cancelado: "Cancelado",
};

export const TRANSICIONES: Record<EstadoOrden, EstadoOrden[]> = {
  Recibido: ["EnDiagnostico", "Cancelado"],
  EnDiagnostico: ["Presupuestado", "Cancelado"],
  Presupuestado: ["EnReparacion", "Cancelado"],
  EnReparacion: ["Listo", "Cancelado"],
  Listo: ["Entregado"],
  Entregado: [],
  Cancelado: [],
};

export interface IOrdenDetalle {
  id: number;
  servicioId: number;
  servicioNombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface IOrdenRepuestoDetalle {
  id: number;
  repuestoId: number;
  repuestoNombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface IOrden {
  id: number;
  numeroOrden: string;
  equipoId: number;
  equipoTipo: string | null;
  equipoMarca: string | null;
  equipoModelo: string | null;
  equipoNumeroSerie: string | null;
  clienteId: number;
  clienteNombre: string;
  usuarioId: number;
  usuarioNombre: string;
  fechaIngreso: string;
  fechaEstimada: string | null;
  problemaReportado: string | null;
  diagnostico: string | null;
  solucion: string | null;
  estado: EstadoOrden;
  costo: number;
  observaciones: string | null;
  fechaEntrega: string | null;
  detallesServicios: IOrdenDetalle[];
  detallesRepuestos: IOrdenRepuestoDetalle[];
}

// POST /api/ordenes → entra en Recibido con numeroOrden autogenerado
export interface IOrdenInput {
  equipoId: number;
  usuarioId: number;
  problemaReportado?: string | null;
  fechaEstimada?: string | null;
  observaciones?: string | null;
}

// PUT /api/ordenes/{id}: si se envía detallesServicios O
// detallesRepuestos, el backend REEMPLAZA AMBOS listados →
// mandar siempre los dos arrays juntos.
export interface IOrdenUpdateInput {
  problemaReportado?: string | null;
  fechaEstimada?: string | null;
  observaciones?: string | null;
  costo?: number;
  detallesServicios?: { servicioId: number; cantidad: number }[];
  detallesRepuestos?: { repuestoId: number; cantidad: number }[];
}

// PUT /api/ordenes/{id}/estado
export interface IOrdenEstadoInput {
  estado: EstadoOrden;
  diagnostico?: string | null;
  solucion?: string | null;
  observaciones?: string | null;
}

// Catálogos para los selects del detalle
export interface IServicio {
  id: number;
  nombre: string;
  precio: number;
  activo: boolean;
}

export interface IRepuesto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  activo: boolean;
}

// ==========================================================
// Formato de fechas y moneda de las pantallas de órdenes.
// ==========================================================
const FORMATO_FECHA = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const FORMATO_FECHA_HORA = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const FORMATO_MONEDA = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatear(formato: Intl.DateTimeFormat, iso: string | null | undefined): string {
  const fecha = iso ? new Date(iso) : null;
  return fecha && !Number.isNaN(fecha.getTime()) ? formato.format(fecha) : "—";
}

export const formatearFecha = (iso: string | null | undefined) => formatear(FORMATO_FECHA, iso);
export const formatearFechaHora = (iso: string | null | undefined) =>
  formatear(FORMATO_FECHA_HORA, iso);

export function formatearMoneda(valor: number): string {
  return FORMATO_MONEDA.format(valor);
}

// <input type="date"> trabaja con "YYYY-MM-DD"
export function paraInputFecha(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : "";
}

export function describirEquipo(
  tipo: string | null,
  marca: string | null,
  modelo: string | null,
): string {
  return [tipo, marca, modelo].filter(Boolean).join(" ") || "Equipo sin datos";
}

const URL_BASE = "/api/ordenes";

export default function useOrdenesApi() {
  const [ordenes, setOrdenes] = useState<IOrden[]>([]);
  const { cargando, error, ejecutar } = useCarga();

  // Estado de UI
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroEstado>("Todos");
  const [openModal, setOpenModal] = useState(false);

  const obtenerOrdenes = useCallback(
    () =>
      ejecutar(async () => {
        const datos = await pedirApi<IOrden[]>(URL_BASE, "Error al obtener las órdenes");
        setOrdenes(datos);
        return datos;
      }).catch(() => undefined),
    [ejecutar],
  );

  // La orden nueva entra en estado Recibido.
  const agregarOrden = useCallback(
    (orden: IOrdenInput) =>
      ejecutar(async () => {
        const nueva = await pedirApi<IOrden>(URL_BASE, "Error al crear la orden", {
          method: "POST",
          body: orden,
        });
        setOrdenes((actuales) => [nueva, ...actuales]);
        return nueva;
      }),
    [ejecutar],
  );

  // Al eliminar, el backend restaura el stock de repuestos.
  const eliminarOrden = useCallback(
    (id: number) =>
      ejecutar(async () => {
        await pedirApi(`${URL_BASE}/${id}`, "Error al eliminar la orden", {
          method: "DELETE",
        });
        setOrdenes((actuales) => actuales.filter((o) => o.id !== id));
      }),
    [ejecutar],
  );

  useEffect(() => {
    obtenerOrdenes();
  }, [obtenerOrdenes]);

  return {
    ordenes,
    cargando,
    error,
    obtenerOrdenes,
    agregarOrden,
    eliminarOrden,
    busqueda,
    setBusqueda,
    filtro,
    setFiltro,
    openModal,
    setOpenModal,
  };
}

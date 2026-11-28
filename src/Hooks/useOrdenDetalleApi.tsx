

import { useState, useEffect, useCallback } from "react";
import type {
  EstadoOrden,
  IOrden,
  IOrdenEstadoInput,
  IOrdenUpdateInput,
  IRepuesto,
  IServicio,
} from "./useOrdenesApi";
import { headersSesion } from "./useSesion";
import { pedirApi, mensajeDeError } from "../utils/api";

const URL_BASE = "/api/ordenes";

export type TipoLinea = "servicio" | "repuesto";

interface LineaEnvio {
  itemId: number;
  cantidad: number;
}

// Si se manda un array de líneas, el backend REEMPLAZA los dos:
// por eso siempre se reenvían servicios y repuestos completos
// (opcionalmente sin la línea que se quiere quitar).
function lineasParaEnviar(orden: IOrden, quitar?: { tipo: TipoLinea; detalleId: number }) {
  const seQueda = (tipo: TipoLinea, id: number) =>
    !(quitar && quitar.tipo === tipo && quitar.detalleId === id);
  return {
    detallesServicios: orden.detallesServicios
      .filter((d) => seQueda("servicio", d.id))
      .map((d): LineaEnvio => ({ itemId: d.servicioId, cantidad: d.cantidad })),
    detallesRepuestos: orden.detallesRepuestos
      .filter((d) => seQueda("repuesto", d.id))
      .map((d): LineaEnvio => ({ itemId: d.repuestoId, cantidad: d.cantidad })),
  };
}

function aCuerpo(lineas: ReturnType<typeof lineasParaEnviar>): IOrdenUpdateInput {
  return {
    detallesServicios: lineas.detallesServicios.map((l) => ({ servicioId: l.itemId, cantidad: l.cantidad })),
    detallesRepuestos: lineas.detallesRepuestos.map((l) => ({ repuestoId: l.itemId, cantidad: l.cantidad })),
  };
}

export default function useOrdenDetalleApi(id: number) {
  const [orden, setOrden] = useState<IOrden | null>(null);
  const [servicios, setServicios] = useState<IServicio[]>([]);
  const [repuestos, setRepuestos] = useState<IRepuesto[]>([]);
  const [sinPermisoRepuestos, setSinPermisoRepuestos] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado de UI (modales)
  const [openEditar, setOpenEditar] = useState(false);
  const [estadoDestino, setEstadoDestino] = useState<EstadoOrden | null>(null);
  const [lineaNueva, setLineaNueva] = useState<TipoLinea | null>(null);

  // GET /api/ordenes/{id}
  const cargarOrden = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setOrden(await pedirApi<IOrden>(`${URL_BASE}/${id}`, "Error al obtener la orden"));
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, [id]);

  // Catálogos para el modal de líneas. Si fallan, el modal queda vacío.
  // El rol Recepcion recibe 403 en repuestos.
  const cargarCatalogos = useCallback(async () => {
    const opciones = { headers: headersSesion() };
    const [resServicios, resRepuestos] = await Promise.all([
      fetch("/api/servicios?soloActivos=true", opciones).catch(() => null),
      fetch("/api/repuestos?soloActivos=true", opciones).catch(() => null),
    ]);
    if (resServicios?.ok) setServicios(await resServicios.json());
    if (resRepuestos?.ok) setRepuestos(await resRepuestos.json());
    else if (resRepuestos?.status === 403) setSinPermisoRepuestos(true);
  }, []);

  // PUT /api/ordenes/{id} y recarga para ver los costos actualizados.
  // Para editar textos se mandan sin arrays: así el backend no toca las líneas.
  const editarOrden = useCallback(
    async (cuerpo: IOrdenUpdateInput) => {
      await pedirApi(`${URL_BASE}/${id}`, "Error al actualizar la orden", {
        method: "PUT",
        body: cuerpo,
      });
      await cargarOrden();
    },
    [id, cargarOrden],
  );

  // La nota va en el campo que corresponde al estado destino.
  const cambiarEstado = useCallback(
    async (estado: EstadoOrden, nota: string) => {
      const texto = nota.trim() || null;
      const cuerpo: IOrdenEstadoInput = { estado };
      if (estado === "EnDiagnostico") cuerpo.diagnostico = texto;
      else if (estado === "Listo") cuerpo.solucion = texto;
      else cuerpo.observaciones = texto;

      await pedirApi(`${URL_BASE}/${id}/estado`, "Error al cambiar el estado", {
        method: "PUT",
        body: cuerpo,
      });
      await cargarOrden();
    },
    [id, cargarOrden],
  );

  const agregarLinea = useCallback(
    async (tipo: TipoLinea, itemId: number, cantidad: number) => {
      if (!orden) return;
      const lineas = lineasParaEnviar(orden);
      const lista = tipo === "servicio" ? lineas.detallesServicios : lineas.detallesRepuestos;
      const existente = lista.find((l) => l.itemId === itemId);
      if (existente) existente.cantidad += cantidad;
      else lista.push({ itemId, cantidad });
      await editarOrden(aCuerpo(lineas));
    },
    [orden, editarOrden],
  );

  const quitarLinea = useCallback(
    async (tipo: TipoLinea, detalleId: number) => {
      if (!orden) return;
      await editarOrden(aCuerpo(lineasParaEnviar(orden, { tipo, detalleId })));
    },
    [orden, editarOrden],
  );

  const eliminarOrden = useCallback(async () => {
    await pedirApi(`${URL_BASE}/${id}`, "Error al eliminar la orden", { method: "DELETE" });
  }, [id]);

  useEffect(() => {
    cargarOrden();
    cargarCatalogos();
  }, [cargarOrden, cargarCatalogos]);

  return {
    orden,
    servicios,
    repuestos,
    sinPermisoRepuestos,
    cargando,
    error,
    cargarOrden,
    editarOrden,
    cambiarEstado,
    agregarLinea,
    quitarLinea,
    eliminarOrden,
    openEditar,
    setOpenEditar,
    estadoDestino,
    setEstadoDestino,
    lineaNueva,
    setLineaNueva,
  };
}



import { useState, useEffect, useCallback } from "react";
import type {
  EstadoOrden,
  IOrden,
  IOrdenEstadoInput,
  IOrdenUpdateInput,
  IRepuesto,
  IServicio,
} from "./useOrdenesApi";
import { headersSesion, leerError } from "./useSesion";

const URL_BASE = "/api/ordenes";

export type TipoLinea = "servicio" | "repuesto";

export interface LineaAQuitar {
  tipo: TipoLinea;
  detalleId: number;
  nombre: string;
}

export default function useOrdenDetalleApi(id: number) {
  const [orden, setOrden] = useState<IOrden | null>(null);
  const [servicios, setServicios] = useState<IServicio[]>([]);
  const [repuestos, setRepuestos] = useState<IRepuesto[]>([]);
  const [sinPermisoRepuestos, setSinPermisoRepuestos] = useState(false);

  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Estado de UI (modales) ---
  const [openEditar, setOpenEditar] = useState(false);
  const [estadoDestino, setEstadoDestino] = useState<EstadoOrden | null>(null);
  const [lineaNueva, setLineaNueva] = useState<TipoLinea | null>(null);
  const [lineaAQuitar, setLineaAQuitar] = useState<LineaAQuitar | null>(null);
  const [openEliminar, setOpenEliminar] = useState(false);

  // GET /api/ordenes/{id}
  const cargarOrden = useCallback(async (): Promise<IOrden | undefined> => {
    setCargando(true);
    setError(null);

    try {
      const respuesta = await fetch(`${URL_BASE}/${id}`, {
        headers: headersSesion(),
      });

      if (!respuesta.ok) {
        throw await leerError(respuesta, "Error al obtener la orden");
      }

      const datos: IOrden = await respuesta.json();
      setOrden(datos);
      return datos;
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error desconocido",
      );
    } finally {
      setCargando(false);
    }
  }, [id]);

  // Catálogos para los modales de líneas
  const cargarCatalogos = useCallback(async () => {
    try {
      const respuesta = await fetch("/api/servicios?soloActivos=true", {
        headers: headersSesion(),
      });

      if (respuesta.ok) {
        const datos: IServicio[] = await respuesta.json();
        setServicios(datos);
      }
    } catch {
      // Sin catálogo de servicios el modal muestra "no hay datos"
    }

    try {
      const respuesta = await fetch("/api/repuestos?soloActivos=true", {
        headers: headersSesion(),
      });

      if (respuesta.ok) {
        const datos: IRepuesto[] = await respuesta.json();
        setRepuestos(datos);
      } else if (respuesta.status === 403) {
        // El rol Recepcion no tiene acceso al módulo de repuestos
        setSinPermisoRepuestos(true);
      }
    } catch {
      // Igual que arriba: el panel queda vacío
    }
  }, []);

  // PUT genérico (textos o líneas) + recarga para reflejar costos
  const enviarCambios = useCallback(
    async (cuerpo: IOrdenUpdateInput): Promise<void> => {
      const respuesta = await fetch(`${URL_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...headersSesion() },
        body: JSON.stringify(cuerpo),
      });

      if (!respuesta.ok) {
        throw await leerError(respuesta, "Error al actualizar la orden");
      }

      await cargarOrden();
    },
    [id, cargarOrden],
  );

  // Editar solo los textos: NO se envían los arrays de detalles,
  // así el backend no toca las líneas ni el stock.
  const editarOrden = useCallback(
    async (datos: IOrdenUpdateInput): Promise<void> => {
      await enviarCambios(datos);
    },
    [enviarCambios],
  );

  // PUT /api/ordenes/{id}/estado
  // La nota va en el campo que corresponde al estado destino.
  const cambiarEstado = useCallback(
    async (estado: EstadoOrden, nota: string): Promise<void> => {
      const texto = nota.trim() || null;

      const cuerpo: IOrdenEstadoInput = { estado };

      if (estado === "EnDiagnostico") {
        cuerpo.diagnostico = texto;
      } else if (estado === "Listo") {
        cuerpo.solucion = texto;
      } else {
        cuerpo.observaciones = texto;
      }

      const respuesta = await fetch(`${URL_BASE}/${id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...headersSesion() },
        body: JSON.stringify(cuerpo),
      });

      if (!respuesta.ok) {
        throw await leerError(respuesta, "Error al cambiar el estado");
      }

      await cargarOrden();
    },
    [id, cargarOrden],
  );

  // Agregar línea: se reconstruyen los DOS arrays completos
  const agregarLinea = useCallback(
    async (tipo: TipoLinea, itemId: number, cantidad: number): Promise<void> => {
      if (!orden) return;

      const lineasServicios = orden.detallesServicios.map((detalle) => ({
        servicioId: detalle.servicioId,
        cantidad: detalle.cantidad,
      }));

      const lineasRepuestos = orden.detallesRepuestos.map((detalle) => ({
        repuestoId: detalle.repuestoId,
        cantidad: detalle.cantidad,
      }));

      if (tipo === "servicio") {
        const existente = lineasServicios.find(
          (linea) => linea.servicioId === itemId,
        );

        if (existente) existente.cantidad += cantidad;
        else lineasServicios.push({ servicioId: itemId, cantidad });
      } else {
        const existente = lineasRepuestos.find(
          (linea) => linea.repuestoId === itemId,
        );

        if (existente) existente.cantidad += cantidad;
        else lineasRepuestos.push({ repuestoId: itemId, cantidad });
      }

      await enviarCambios({
        detallesServicios: lineasServicios,
        detallesRepuestos: lineasRepuestos,
      });
    },
    [orden, enviarCambios],
  );

  // Quitar línea: idem, se reenvían los dos arrays sin esa línea
  const quitarLinea = useCallback(
    async (tipo: TipoLinea, detalleId: number): Promise<void> => {
      if (!orden) return;

      const lineasServicios = orden.detallesServicios
        .filter(
          (detalle) => !(tipo === "servicio" && detalle.id === detalleId),
        )
        .map((detalle) => ({
          servicioId: detalle.servicioId,
          cantidad: detalle.cantidad,
        }));

      const lineasRepuestos = orden.detallesRepuestos
        .filter(
          (detalle) => !(tipo === "repuesto" && detalle.id === detalleId),
        )
        .map((detalle) => ({
          repuestoId: detalle.repuestoId,
          cantidad: detalle.cantidad,
        }));

      await enviarCambios({
        detallesServicios: lineasServicios,
        detallesRepuestos: lineasRepuestos,
      });
    },
    [orden, enviarCambios],
  );

  // DELETE /api/ordenes/{id}
  const eliminarOrden = useCallback(async (): Promise<void> => {
    const respuesta = await fetch(`${URL_BASE}/${id}`, {
      method: "DELETE",
      headers: headersSesion(),
    });

    if (!respuesta.ok) {
      throw await leerError(respuesta, "Error al eliminar la orden");
    }
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
    lineaAQuitar,
    setLineaAQuitar,
    openEliminar,
    setOpenEliminar,
  };
}

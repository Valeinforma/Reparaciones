
import { useState, useEffect, useCallback } from "react";
import type { EstadoOrden } from "./useOrdenesApi";
import { pedirApi } from "../utils/api";
import useCarga from "./useCarga";

// Forma de los datos que devuelve /api/equipos.
export interface IEquipo {
  id: number;
  clienteId: number;
  tipo: string | null;
  marca: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  descripcion: string | null;
  clienteNombre: string;
  ordenEstado: EstadoOrden | null;
}

// Cuerpo de POST/PUT /api/equipos (vacíos → null en el form).
export interface IEquipoInput {
  clienteId: number;
  tipo?: string | null;
  marca?: string | null;
  modelo?: string | null;
  numeroSerie?: string | null;
  descripcion?: string | null;
}

const URL_BASE = "/api/equipos";

export default function useEquiposApi() {
  const [equipos, setEquipos] = useState<IEquipo[]>([]);
  const { cargando, error, ejecutar } = useCarga();

  // Estado de UI
  const [busqueda, setBusqueda] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<IEquipo | null>(null);

  // GET /api/equipos (o ?clienteId= si se pide desde Clientes)
  const obtenerEquipos = useCallback(
    (clienteId?: number) =>
      ejecutar(async () => {
        const url = clienteId ? `${URL_BASE}?clienteId=${clienteId}` : URL_BASE;
        const datos = await pedirApi<IEquipo[]>(url, "Error al obtener los equipos");
        setEquipos(datos);
        return datos;
      }).catch(() => undefined),
    [ejecutar],
  );

  // El POST devuelve clienteNombre vacío → recargamos la lista.
  const agregarEquipo = useCallback(
    (equipo: IEquipoInput) =>
      ejecutar(async () => {
        const nuevo = await pedirApi<IEquipo>(URL_BASE, "Error al crear el equipo", {
          method: "POST",
          body: equipo,
        });
        setEquipos((actuales) => [nuevo, ...actuales]);
        await obtenerEquipos();
        return nuevo;
      }),
    [ejecutar, obtenerEquipos],
  );

  // Recargamos para reflejar el cambio de cliente y el estado de la orden.
  const editarEquipo = useCallback(
    (id: number, equipo: IEquipoInput) =>
      ejecutar(async () => {
        await pedirApi(`${URL_BASE}/${id}`, "Error al actualizar el equipo", {
          method: "PUT",
          body: equipo,
        });
        await obtenerEquipos();
      }),
    [ejecutar, obtenerEquipos],
  );

  // El backend responde 409 si el equipo tiene órdenes.
  const eliminarEquipo = useCallback(
    (id: number) =>
      ejecutar(async () => {
        await pedirApi(`${URL_BASE}/${id}`, "Error al eliminar el equipo", {
          method: "DELETE",
        });
        setEquipos((actuales) => actuales.filter((e) => e.id !== id));
      }),
    [ejecutar],
  );

  useEffect(() => {
    obtenerEquipos();
  }, [obtenerEquipos]);

  return {
    equipos,
    cargando,
    error,
    obtenerEquipos,
    agregarEquipo,
    editarEquipo,
    eliminarEquipo,
    busqueda,
    setBusqueda,
    openModal,
    setOpenModal,
    equipoSeleccionado,
    setEquipoSeleccionado,
  };
}

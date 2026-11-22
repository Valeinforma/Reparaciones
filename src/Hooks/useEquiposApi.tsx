
import { useState, useEffect, useCallback } from "react";
import type { EstadoOrden } from "./useOrdenesApi";
import { headersSesion, leerError } from "./useSesion";

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
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- Estado de UI ---
  const [busqueda, setBusqueda] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<IEquipo | null>(
    null,
  );
  const [equipoAEliminar, setEquipoAEliminar] = useState<IEquipo | null>(null);

  // GET /api/equipos (o ?clienteId= si se pide desde Clientes)
  const obtenerEquipos = useCallback(
    async (clienteId?: number): Promise<IEquipo[] | undefined> => {
      setCargando(true);
      setError(null);

      const url = clienteId
        ? `${URL_BASE}?clienteId=${clienteId}`
        : URL_BASE;

      try {
        const respuesta = await fetch(url, { headers: headersSesion() });

        if (!respuesta.ok) {
          throw await leerError(respuesta, "Error al obtener los equipos");
        }

        const datos: IEquipo[] = await respuesta.json();
        setEquipos(datos);
        return datos;
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Ocurrió un error desconocido",
        );
      } finally {
        setCargando(false);
      }
    },
    [],
  );

  // POST /api/equipos
  const agregarEquipo = useCallback(
    async (equipo: IEquipoInput): Promise<IEquipo | undefined> => {
      setCargando(true);
      setError(null);

      try {
        const respuesta = await fetch(URL_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headersSesion() },
          body: JSON.stringify(equipo),
        });

        if (!respuesta.ok) {
          throw await leerError(respuesta, "Error al crear el equipo");
        }

        const nuevo: IEquipo = await respuesta.json();

        // El POST devuelve clienteNombre vacío → completamos con
        // los datos del formulario y recargamos en segundo plano.
        setEquipos((actuales) => [nuevo, ...actuales]);
        await obtenerEquipos();

        return nuevo;
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Ocurrió un error desconocido",
        );
        throw err;
      } finally {
        setCargando(false);
      }
    },
    [obtenerEquipos],
  );

  // PUT /api/equipos/{id} → recargamos para reflejar el cambio
  // de cliente y el estado de la última orden.
  const editarEquipo = useCallback(
    async (id: number, equipo: IEquipoInput): Promise<void> => {
      setCargando(true);
      setError(null);

      try {
        const respuesta = await fetch(`${URL_BASE}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...headersSesion() },
          body: JSON.stringify(equipo),
        });

        if (!respuesta.ok) {
          throw await leerError(respuesta, "Error al actualizar el equipo");
        }

        await obtenerEquipos();
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Ocurrió un error desconocido",
        );
        throw err;
      } finally {
        setCargando(false);
      }
    },
    [obtenerEquipos],
  );

  // DELETE /api/equipos/{id}
  // El backend responde 409 si el equipo tiene órdenes.
  const eliminarEquipo = useCallback(async (id: number): Promise<void> => {
    setCargando(true);
    setError(null);

    try {
      const respuesta = await fetch(`${URL_BASE}/${id}`, {
        method: "DELETE",
        headers: headersSesion(),
      });

      if (!respuesta.ok) {
        throw await leerError(respuesta, "Error al eliminar el equipo");
      }

      setEquipos((actuales) => actuales.filter((e) => e.id !== id));
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error desconocido",
      );
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

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
    equipoAEliminar,
    setEquipoAEliminar,
  };
}

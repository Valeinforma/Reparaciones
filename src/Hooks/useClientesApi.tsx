
import { useState, useEffect, useCallback } from "react";
import type ICliente from "../Interfaces/ICliente";
import { headersSesion, leerError } from "./useSesion";

const URL_BASE = "/api/clientes";

export default function useClientesApi() {
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- Estado de UI (búsqueda y modales) ---
  const [busqueda, setBusqueda] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ICliente | null>(
    null,
  );
  const [clienteAEliminar, setClienteAEliminar] = useState<ICliente | null>(null);
  const [clienteEquipos, setClienteEquipos] = useState<ICliente | null>(null);

  // GET /api/clientes
  const obtenerClientes = useCallback(async (): Promise<
    ICliente[] | undefined
  > => {
    setCargando(true);
    setError(null);

    try {
      const respuesta = await fetch(URL_BASE, { headers: headersSesion() });

      if (!respuesta.ok) {
        throw await leerError(respuesta, "Error al obtener los clientes");
      }

      const datos: ICliente[] = await respuesta.json();
      setClientes(datos);
      return datos;
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error desconocido",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  // POST /api/clientes
  const agregarCliente = useCallback(
    async (
      cliente: Omit<ICliente, "id" | "fechaAlta" | "totalEquipos">,
    ): Promise<ICliente | undefined> => {
      setCargando(true);
      setError(null);

      try {
        const respuesta = await fetch(URL_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headersSesion() },
          body: JSON.stringify(cliente),
        });

        if (!respuesta.ok) {
          throw await leerError(respuesta, "Error al crear el cliente");
        }

        const nuevo: ICliente = await respuesta.json();
        setClientes((actuales) => [...actuales, nuevo]);
        return nuevo;
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Ocurrió un error desconocido",
        );
        // Re-lanzamos para que el modal muestre el error y siga abierto
        throw err;
      } finally {
        setCargando(false);
      }
    },
    [],
  );

  // PUT /api/clientes/{id} → el backend responde { mensaje },
  // así que actualizamos la lista con los datos del formulario
  // conservando totalEquipos.
  const editarCliente = useCallback(
    async (id: number, cliente: Partial<ICliente>): Promise<void> => {
      setCargando(true);
      setError(null);

      try {
        const respuesta = await fetch(`${URL_BASE}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...headersSesion() },
          body: JSON.stringify(cliente),
        });

        if (!respuesta.ok) {
          throw await leerError(respuesta, "Error al actualizar el cliente");
        }

        setClientes((actuales) =>
          actuales.map((c) => (c.id === id ? { ...c, ...cliente } : c)),
        );
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Ocurrió un error desconocido",
        );
        throw err;
      } finally {
        setCargando(false);
      }
    },
    [],
  );

  // DELETE /api/clientes/{id}
  const eliminarCliente = useCallback(async (id: number): Promise<void> => {
    setCargando(true);
    setError(null);

    try {
      const respuesta = await fetch(`${URL_BASE}/${id}`, {
        method: "DELETE",
        headers: headersSesion(),
      });

      if (!respuesta.ok) {
        throw await leerError(respuesta, "Error al eliminar el cliente");
      }

      setClientes((actuales) => actuales.filter((c) => c.id !== id));
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
    obtenerClientes();
  }, [obtenerClientes]);

  return {
    clientes,
    cargando,
    error,
    obtenerClientes,
    agregarCliente,
    editarCliente,
    eliminarCliente,
    busqueda,
    setBusqueda,
    openModal,
    setOpenModal,
    clienteSeleccionado,
    setClienteSeleccionado,
    clienteAEliminar,
    setClienteAEliminar,
    clienteEquipos,
    setClienteEquipos,
  };
}

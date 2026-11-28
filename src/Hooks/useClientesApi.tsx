import { useState, useEffect, useCallback } from "react";
import type ICliente from "../Interfaces/ICliente";
import { pedirApi } from "../utils/api";
import useCarga from "./useCarga";

const URL_BASE = "/api/clientes";

type IClienteInput = Omit<ICliente, "id" | "fechaAlta" | "totalEquipos">;

export default function useClientesApi() {
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const { cargando, error, ejecutar } = useCarga();

  // Estado de UI (búsqueda y modales)
  const [busqueda, setBusqueda] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ICliente | null>(null);
  const [clienteEquipos, setClienteEquipos] = useState<ICliente | null>(null);

  const obtenerClientes = useCallback(
    () =>
      ejecutar(async () => {
        const datos = await pedirApi<ICliente[]>(URL_BASE, "Error al obtener los clientes");
        setClientes(datos);
        return datos;
      }).catch(() => undefined),
    [ejecutar],
  );

  const agregarCliente = useCallback(
    (cliente: IClienteInput) =>
      ejecutar(async () => {
        const nuevo = await pedirApi<ICliente>(URL_BASE, "Error al crear el cliente", {
          method: "POST",
          body: cliente,
        });
        setClientes((actuales) => [...actuales, nuevo]);
        return nuevo;
      }),
    [ejecutar],
  );

  // El PUT responde { mensaje }: actualizamos la lista con los datos del form.
  const editarCliente = useCallback(
    (id: number, cliente: Partial<ICliente>) =>
      ejecutar(async () => {
        await pedirApi(`${URL_BASE}/${id}`, "Error al actualizar el cliente", {
          method: "PUT",
          body: cliente,
        });
        setClientes((actuales) =>
          actuales.map((c) => (c.id === id ? { ...c, ...cliente } : c)),
        );
      }),
    [ejecutar],
  );

  const eliminarCliente = useCallback(
    (id: number) =>
      ejecutar(async () => {
        await pedirApi(`${URL_BASE}/${id}`, "Error al eliminar el cliente", {
          method: "DELETE",
        });
        setClientes((actuales) => actuales.filter((c) => c.id !== id));
      }),
    [ejecutar],
  );

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
    clienteEquipos,
    setClienteEquipos,
  };
}

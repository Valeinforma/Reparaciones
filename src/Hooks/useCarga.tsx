import { useState, useCallback } from "react";
import { mensajeDeError } from "../utils/api";

// Estado "cargando / error" que comparten todos los hooks de API.
// ejecutar() envuelve un pedido: marca cargando, guarda el error y lo
// relanza para que el modal que lo llamó pueda mostrarlo.
export default function useCarga(cargandoInicial = false) {
  const [cargando, setCargando] = useState(cargandoInicial);
  const [error, setError] = useState<string | null>(null);

  const ejecutar = useCallback(async <T,>(accion: () => Promise<T>): Promise<T> => {
    setCargando(true);
    setError(null);
    try {
      return await accion();
    } catch (err) {
      setError(mensajeDeError(err));
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  return { cargando, error, ejecutar };
}

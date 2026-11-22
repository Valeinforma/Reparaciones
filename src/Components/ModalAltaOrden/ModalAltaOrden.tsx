import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../Modal/Modal";
import { useOrdenContext } from "../OrdenContext/OrdenContext";
import { useClienteContext } from "../ClienteContext/ClienteContext";
import { useSesion, headersSesion, leerError } from "../../Hooks/useSesion";
import type { IEquipo } from "../../Hooks/useEquiposApi";
import {
  describirEquipo,
  type IOrdenInput,
} from "../../Hooks/useOrdenesApi";
import "./ModalAltaOrden.css";

interface ModalAltaOrdenProps {
  onCerrar: () => void;
}


export default function ModalAltaOrden({ onCerrar }: ModalAltaOrdenProps) {
  const { agregarOrden } = useOrdenContext();
  const { clientes } = useClienteContext();
  const sesion = useSesion();
  const navigate = useNavigate();

  const [clienteId, setClienteId] = useState(0);
  const [equipoId, setEquipoId] = useState(0);
  const [equipos, setEquipos] = useState<IEquipo[] | null>(null);
  const [cargandoEquipos, setCargandoEquipos] = useState(false);
  const [errorEquipos, setErrorEquipos] = useState<string | null>(null);

  const [fechaEstimada, setFechaEstimada] = useState("");
  const [problemaReportado, setProblemaReportado] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    setEquipoId(0);
    setErrorEquipos(null);

    if (!clienteId) {
      setEquipos(null);
      return;
    }

    let vivo = true;
    setCargandoEquipos(true);

    async function cargarEquipos() {
      try {
        const respuesta = await fetch(`/api/equipos?clienteId=${clienteId}`, {
          headers: headersSesion(),
        });

        if (!respuesta.ok) {
          throw await leerError(respuesta, "Error al obtener los equipos");
        }

        const datos: IEquipo[] = await respuesta.json();

        if (vivo) setEquipos(datos);
      } catch (err: unknown) {
        if (vivo) {
          setErrorEquipos(
            err instanceof Error ? err.message : "Ocurrió un error desconocido",
          );
        }
      } finally {
        if (vivo) setCargandoEquipos(false);
      }
    }

    cargarEquipos();

    return () => {
      vivo = false;
    };
  }, [clienteId]);

  async function alGuardar(e: React.FormEvent) {
    e.preventDefault();

    if (guardando) return;

    if (!clienteId) {
      setError("Seleccioná un cliente.");
      return;
    }

    if (!equipoId) {
      setError("Seleccioná el equipo que ingresa.");
      return;
    }

    if (!sesion) {
      setError("La sesión no es válida. Volvé a iniciar sesión.");
      return;
    }

    const datos: IOrdenInput = {
      equipoId,
      usuarioId: sesion.id,
      fechaEstimada: fechaEstimada || null,
      problemaReportado: problemaReportado.trim() || null,
      observaciones: observaciones.trim() || null,
    };

    setGuardando(true);
    setError(null);

    try {
      const nueva = await agregarOrden(datos);
      onCerrar();

      // Directo al detalle de la orden recién creada
      if (nueva) navigate(`/ordenes/${nueva.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
      setGuardando(false);
    }
  }

  return (
    <Modal titulo="Nueva orden de servicio" onCerrar={onCerrar} ancho="ancho">
      <form className="form-orden" onSubmit={alGuardar}>
        <div className="form-orden__fila">
          <label>
            Cliente *
            <select
              value={clienteId}
              onChange={(e) => setClienteId(Number(e.target.value))}
              autoFocus
            >
              <option value={0}>Seleccioná un cliente…</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} {cliente.apellido}
                </option>
              ))}
            </select>
          </label>

          <label>
            Equipo *
            <select
              value={equipoId}
              onChange={(e) => setEquipoId(Number(e.target.value))}
              disabled={!clienteId || cargandoEquipos}
            >
              <option value={0}>
                {!clienteId
                  ? "Elegí primero un cliente"
                  : cargandoEquipos
                    ? "Cargando equipos…"
                    : "Seleccioná un equipo…"}
              </option>
              {equipos?.map((equipo) => (
                <option key={equipo.id} value={equipo.id}>
                  {describirEquipo(equipo.tipo, equipo.marca, equipo.modelo)}
                  {equipo.numeroSerie ? ` · S/N ${equipo.numeroSerie}` : ""}
                </option>
              ))}
            </select>
          </label>
        </div>

        {errorEquipos && <p className="form-orden__error">{errorEquipos}</p>}

        {clienteId > 0 && !cargandoEquipos && equipos?.length === 0 && (
          <p className="form-orden__aviso">
            Este cliente no tiene equipos cargados. Crea el equipo desde la
            seccion Equipos y volve a intentar.
          </p>
        )}

        <label>
          Fecha estimada de entrega
          <input
            type="date"
            value={fechaEstimada}
            onChange={(e) => setFechaEstimada(e.target.value)}
          />
        </label>

        <label>
          Problema reportado
          <textarea
            rows={3}
            value={problemaReportado}
            onChange={(e) => setProblemaReportado(e.target.value)}
            placeholder="Qué informa el cliente: falla, ruidos, no enciende…"
          />
        </label>

        <label>
          Observaciones
          <textarea
            rows={2}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Accesorios recibidos, estado estético, etc."
          />
        </label>

        {error && <p className="form-orden__error">{error}</p>}

        <div className="modal-acciones">
          <button
            type="button"
            className="boton-secundario"
            onClick={onCerrar}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button type="submit" className="boton-primario" disabled={guardando}>
            {guardando ? "Creando.." : "Crear orden"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

import { useEffect, useState } from "react";
import Modal from "../Modal/Modal";
import EstadoBadge from "../EstadoBadge/EstadoBadge";
import { headersSesion, leerError } from "../../Hooks/useSesion";
import type ICliente from "../../Interfaces/ICliente";
import type { IEquipo } from "../../Hooks/useEquiposApi";
import "./ModalEquiposCliente.css";

const URL_BASE = "/api/equipos";

interface ModalEquiposClienteProps {
  cliente: ICliente;
  onCerrar: () => void;
}


export default function ModalEquiposCliente({
  cliente,
  onCerrar,
}: ModalEquiposClienteProps) {
  const [equipos, setEquipos] = useState<IEquipo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;

    async function cargar() {
      try {
        const respuesta = await fetch(`${URL_BASE}?clienteId=${cliente.id}`, {
          headers: headersSesion(),
        });

        if (!respuesta.ok) {
          throw await leerError(respuesta, "Error al obtener los equipos");
        }

        const datos: IEquipo[] = await respuesta.json();

        if (vivo) setEquipos(datos);
      } catch (err: unknown) {
        if (vivo) {
          setError(
            err instanceof Error ? err.message : "Ocurrió un error desconocido",
          );
        }
      }
    }

    cargar();

    return () => {
      vivo = false;
    };
  }, [cliente.id]);

  return (
    <Modal
      titulo={`Equipos de ${cliente.nombre} ${cliente.apellido}`}
      onCerrar={onCerrar}
    >
      {error && <p className="form-cliente__error">{error}</p>}

      {equipos === null && !error && <p className="estado">Cargando…</p>}

      {equipos?.length === 0 && (
        <p className="estado">Este cliente no tiene equipos cargados.</p>
      )}

      <ul className="lista-equipos">
        {equipos?.map((equipo) => (
          <li key={equipo.id}>
            <div className="lista-equipos__datos">
              <span className="lista-equipos__nombre">
                {[equipo.tipo, equipo.marca, equipo.modelo]
                  .filter(Boolean)
                  .join(" ") || `Equipo #${equipo.id}`}
              </span>
              {equipo.numeroSerie && (
                <span className="lista-equipos__serie">
                  S/N {equipo.numeroSerie}
                </span>
              )}
            </div>

            {equipo.ordenEstado && <EstadoBadge estado={equipo.ordenEstado} />}
          </li>
        ))}
      </ul>
    </Modal>
  );
}

import EstadoBadge from "../EstadoBadge/EstadoBadge";
import type { IEquipo } from "../../Hooks/useEquiposApi";
import "./Equipo.css";

interface EquipoProps {
  equipo: IEquipo;
  onEditar: () => void;
  onEliminar: () => void;
}

export default function Equipo({ equipo, onEditar, onEliminar }: EquipoProps) {
  const nombre =
    [equipo.tipo, equipo.marca, equipo.modelo].filter(Boolean).join(" ") ||
    `Equipo #${equipo.id}`;

  return (
    <article className="tarjeta-equipo">
      <div className="tarjeta-equipo__principal">
        <h3>{nombre}</h3>
        {equipo.ordenEstado && <EstadoBadge estado={equipo.ordenEstado} />}
      </div>

      <p className="tarjeta-equipo__cliente">{equipo.clienteNombre}</p>

      {equipo.numeroSerie && (
        <p className="tarjeta-equipo__dato">S/N {equipo.numeroSerie}</p>
      )}

      {equipo.descripcion && (
        <p className="tarjeta-equipo__descripcion">{equipo.descripcion}</p>
      )}

      <div className="tarjeta-equipo__acciones">
        <button type="button" onClick={onEditar} title="Editar">
          ✎
        </button>
        <button
          type="button"
          className="accion-peligro"
          onClick={onEliminar}
          title="Eliminar"
        >
          🗑
        </button>
      </div>
    </article>
  );
}

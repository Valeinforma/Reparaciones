import { Link } from "react-router-dom";
import EstadoBadge from "../EstadoBadge/EstadoBadge";
import {
  describirEquipo,
  formatearFecha,
  formatearMoneda,
  type IOrden,
} from "../../Hooks/useOrdenesApi";
import "./Orden.css";

interface OrdenProps {
  orden: IOrden;
  onEliminar: () => void;
}

export default function Orden({ orden, onEliminar }: OrdenProps) {
  return (
    <article className="tarjeta-orden">
      <div className="tarjeta-orden__principal">
        <Link to={`/ordenes/${orden.id}`} className="tarjeta-orden__numero">
          {orden.numeroOrden}
        </Link>
        <EstadoBadge estado={orden.estado} />
      </div>

      <p className="tarjeta-orden__cliente">{orden.clienteNombre}</p>

      <p className="tarjeta-orden__equipo">
        {describirEquipo(
          orden.equipoTipo,
          orden.equipoMarca,
          orden.equipoModelo,
        )}
      </p>

      <div className="tarjeta-orden__pie">
        <span className="tarjeta-orden__fecha">
          {formatearFecha(orden.fechaIngreso)}
        </span>
        <span className="tarjeta-orden__costo">
          {formatearMoneda(orden.costo)}
        </span>
      </div>

      <div className="tarjeta-orden__acciones">
        <Link to={`/ordenes/${orden.id}`} className="tarjeta-orden__ver">
          Ver detalle
        </Link>
        <button
          type="button"
          className="accion-peligro"
          onClick={onEliminar}
          title="Eliminar orden"
        >
          🗑
        </button>
      </div>
    </article>
  );
}

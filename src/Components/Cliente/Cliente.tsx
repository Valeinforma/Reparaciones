import type ICliente from "../../Interfaces/ICliente";
import "./Cliente.css";

interface ClienteProps {
  cliente: ICliente;
  onEditar: () => void;
  onEliminar: () => void;
  onVerEquipos: () => void;
}

export default function Cliente({
  cliente,
  onEditar,
  onEliminar,
  onVerEquipos,
}: ClienteProps) {
  return (
    <article className="tarjeta-cliente">
      <div className="tarjeta-cliente__principal">
        <h3>
          {cliente.nombre} {cliente.apellido}
        </h3>
        <button
          type="button"
          className="tarjeta-cliente__equipos"
          onClick={onVerEquipos}
          title="Ver equipos del cliente"
        >
          {cliente.totalEquipos} {cliente.totalEquipos === 1 ? "equipo" : "equipos"}
        </button>
      </div>

      <p className="tarjeta-cliente__dato">{cliente.email ?? "Sin email"}</p>
      <p className="tarjeta-cliente__dato">
        {cliente.telefono ?? "Sin teléfono"}
      </p>
      {cliente.direccion && (
        <p className="tarjeta-cliente__dato">{cliente.direccion}</p>
      )}

      <div className="tarjeta-cliente__acciones">
        <button type="button" onClick={onVerEquipos} title="Ver equipos">
          🖥
        </button>
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

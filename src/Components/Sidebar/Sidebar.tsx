import { NavLink, useNavigate } from "react-router-dom";
import { borrarSesion } from "../../Hooks/useSesion";
import type { ISesion } from "../../Hooks/useSesion";
import "./Sidebar.css";

const MENU = [
  { ruta: "/ordenes", etiqueta: "Órdenes", icono: "🧾" },
  { ruta: "/clientes", etiqueta: "Clientes", icono: "👤" },
  { ruta: "/equipos", etiqueta: "Equipos", icono: "🖥" },
];

export default function Sidebar({ sesion }: { sesion: ISesion }) {
  const navigate = useNavigate();

  function salir() {
    borrarSesion();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__marca">
        <span className="sidebar__logo">R</span>
        <span>REPARACIONES</span>
      </div>

      <nav className="sidebar__menu">
        {MENU.map((item) => (
          <NavLink
            key={item.ruta}
            to={item.ruta}
            className={({ isActive }) =>
              `sidebar__item${isActive ? " sidebar__item--activo" : ""}`
            }
          >
            <span className="sidebar__icono">{item.icono}</span>
            {item.etiqueta}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__pie">
        <p className="sidebar__usuario">{sesion.nombre}</p>
        <p className="sidebar__rol">{sesion.rol}</p>
        <button type="button" className="sidebar__salir" onClick={salir}>
          Salir
        </button>
      </div>
    </aside>
  );
}

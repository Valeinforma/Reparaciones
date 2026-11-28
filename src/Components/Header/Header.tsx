import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { borrarSesion } from "../../Hooks/useSesion";
import type { ISesion } from "../../Hooks/useSesion";
import "./Header.css";

const MENU = [
  { ruta: "/ordenes", etiqueta: "Órdenes" },
  { ruta: "/clientes", etiqueta: "Clientes" },
  { ruta: "/equipos", etiqueta: "Equipos" },
];

const TITULOS: Record<string, string> = {
  "/ordenes": "Órdenes de servicio",
  "/clientes": "Clientes",
  "/equipos": "Equipos",
};

function iniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Header({ sesion }: { sesion: ISesion }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const titulo =
    TITULOS[pathname] ??
    (pathname.startsWith("/ordenes/") ? "Detalle de orden" : "Reparaciones");

  function salir() {
    borrarSesion();
    navigate("/login", { replace: true });
  }

  return (
    <header className="header">
      <div className="header__barra">
        <div className="header__marca">
          <span className="header__logo">R</span>
          <span className="header__marca-texto">REPARACIONES</span>
        </div>

        <nav className="header__menu">
          {MENU.map((item) => (
            <NavLink
              key={item.ruta}
              to={item.ruta}
              className={({ isActive }) =>
                `header__link${isActive ? " header__link--activo" : ""}`
              }
            >
              {item.etiqueta}
            </NavLink>
          ))}
        </nav>

        <div className="header__usuario">
          <div className="header__datos">
            <span className="header__nombre">{sesion.nombre}</span>
            <span className="header__rol">{sesion.rol}</span>
          </div>
          <span className="header__avatar">{iniciales(sesion.nombre)}</span>
          <button type="button" className="header__salir" onClick={salir}>
            Salir
          </button>
        </div>
      </div>

      <h1 className="header__titulo">{titulo}</h1>
    </header>
  );
}

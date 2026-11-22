import { useLocation } from "react-router-dom";
import type { ISesion } from "../../Hooks/useSesion";
import "./Header.css";

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

  const titulo =
    TITULOS[pathname] ??
    (pathname.startsWith("/ordenes/") ? "Detalle de orden" : "Reparaciones");

  return (
    <header className="header">
      <h1 className="header__titulo">{titulo}</h1>

      <div className="header__usuario">
        <div className="header__datos">
          <span className="header__nombre">{sesion.nombre}</span>
          <span className="header__rol">{sesion.rol}</span>
        </div>
        <span className="header__avatar">{iniciales(sesion.nombre)}</span>
      </div>
    </header>
  );
}

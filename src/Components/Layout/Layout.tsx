import { Navigate, Outlet } from "react-router-dom";
import { useSesion } from "../../Hooks/useSesion";
import Header from "../Header/Header";
import "./Layout.css";

export default function Layout() {
  const sesion = useSesion();

  if (!sesion) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="layout">
      <Header sesion={sesion} />

      <main className="layout__contenido">
        <Outlet />
      </main>

      <footer className="layout__pie">
        TechFix Manager · Sistema interno de reparaciones
      </footer>
    </div>
  );
}

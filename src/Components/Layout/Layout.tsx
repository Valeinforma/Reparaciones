import { Navigate, Outlet } from "react-router-dom";
import { useSesion } from "../../Hooks/useSesion";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import "./Layout.css";


export default function Layout() {
  const sesion = useSesion();

  if (!sesion) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="layout">
      <Sidebar sesion={sesion} />

      <div className="layout__principal">
        <Header sesion={sesion} />

        <main className="layout__contenido">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

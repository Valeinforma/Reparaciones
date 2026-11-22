

import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../Layout/Layout';
import Login from '../Login/Login';
import AppOrdenes from '../AppOrdenes/AppOrdenes';
import AppOrdenDetalle from '../AppOrdenDetalle/AppOrdenDetalle';
import AppClientes from '../AppClientes/AppClientes';
import AppEquipos from '../AppEquipos/AppEquipos';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas: Layout hace de guard + shell */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/ordenes" replace />} />
        <Route path="/ordenes" element={<AppOrdenes />} />
        <Route path="/ordenes/:id" element={<AppOrdenDetalle />} />
        <Route path="/clientes" element={<AppClientes />} />
        <Route path="/equipos" element={<AppEquipos />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

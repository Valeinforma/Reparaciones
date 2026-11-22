# Reparaciones — Gestión de taller

Vite + React 19 + TypeScript + react-router-dom.
Estructura de carpetas siguiendo el patrón del repo ToDoApp
(`Components/X/X.tsx` + CSS, `Hooks/useXApi`, `Interfaces/`, Contexto por módulo).

## Comandos

```bash
npm install      # dependencias
npm run dev      # http://localhost:5173 (requiere backend en :5137)
npm run build    # tsc + vite build
npm run lint     # oxlint
```

## Backend

El proyecto consume la API de TechFix Manager:

```bash
cd "D:\Po\Proyecto Almanaque\Backend"
dotnet run       # http://localhost:5137
```

Credenciales seed: `admin@techfix.com` / `admin123`
(roles: Admin, Tecnico, Recepcion — ver `Backend/seed.sql`).

## Pantallas

| Ruta | Pantalla |
|---|---|
| `/login` | Login (pública) |
| `/ordenes` | Órdenes de servicio (lista) |
| `/ordenes/:id` | Detalle de orden |
| `/clientes` | Clientes |
| `/equipos` | Equipos |

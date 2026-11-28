import { useSyncExternalStore } from "react";

export interface ISesion {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

const CLAVE_SESION = "techfix_sesion";

let cacheSesion: ISesion | null | undefined;

export function obtenerSesion(): ISesion | null {
  if (cacheSesion !== undefined) return cacheSesion;
  const crudo = localStorage.getItem(CLAVE_SESION);
  cacheSesion = crudo ? (JSON.parse(crudo) as ISesion) : null;
  return cacheSesion;
}

export function guardarSesion(sesion: ISesion): void {
  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  cacheSesion = sesion;
  window.dispatchEvent(new Event(CLAVE_SESION));
}

export function borrarSesion(): void {
  localStorage.removeItem(CLAVE_SESION);
  cacheSesion = null;
  window.dispatchEvent(new Event(CLAVE_SESION));
}

export function headersSesion(): Record<string, string> {
  const sesion = obtenerSesion();
  return sesion ? { "X-Usuario-Id": String(sesion.id) } : {};
}

export async function leerError(
  respuesta: Response,
  mensajePorDefecto: string,
): Promise<Error> {
  if (respuesta.status === 401) {
    borrarSesion();
  }

  const datos = await respuesta.json().catch(() => null);

  if (datos && typeof datos.mensaje === "string") {
    return new Error(datos.mensaje);
  }

  return new Error(mensajePorDefecto);
}

export async function iniciarSesion(email: string, password: string): Promise<ISesion> {
  let respuesta: Response;

  try {
    respuesta = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error(
      "No se pudo conectar con el servidor. Verificá tu conexión e intentá de nuevo.",
    );
  }

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    if (respuesta.status >= 500) {
      throw new Error(
        "El servidor no responde en este momento. Esperá unos segundos y volvé a intentar.",
      );
    }

    throw new Error(datos?.mensaje ?? "No se pudo iniciar sesión.");
  }

  if (typeof datos?.id !== "number") {
    throw new Error("Respuesta inválida del servidor.");
  }

  guardarSesion(datos as ISesion);
  return datos as ISesion;
}

function suscribir(alCambiar: () => void) {
  const oyente = () => {
    cacheSesion = undefined;
    alCambiar();
  };

  window.addEventListener(CLAVE_SESION, oyente);
  window.addEventListener("storage", oyente);

  return () => {
    window.removeEventListener(CLAVE_SESION, oyente);
    window.removeEventListener("storage", oyente);
  };
}

export function useSesion(): ISesion | null {
  return useSyncExternalStore(suscribir, obtenerSesion, () => null);
}

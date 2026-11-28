import { headersSesion, leerError } from "../Hooks/useSesion";

interface OpcionesApi {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

// Hace el fetch con la sesión, lanza el mensaje del backend si falla
// y devuelve el JSON de la respuesta (undefined si vino vacía).
export async function pedirApi<T = unknown>(
  url: string,
  mensajeError: string,
  { method = "GET", body }: OpcionesApi = {},
): Promise<T> {
  const respuesta = await fetch(url, {
    method,
    headers:
      body === undefined
        ? headersSesion()
        : { "Content-Type": "application/json", ...headersSesion() },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!respuesta.ok) {
    throw await leerError(respuesta, mensajeError);
  }

  return respuesta.json().catch(() => undefined) as Promise<T>;
}

export function mensajeDeError(err: unknown): string {
  return err instanceof Error ? err.message : "Ocurrió un error desconocido";
}

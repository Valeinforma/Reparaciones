import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { iniciarSesion, useSesion } from "../../Hooks/useSesion";
import "./Login.css";


export default function Login() {
  const sesion = useSesion();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (sesion) {
    return <Navigate to="/ordenes" replace />;
  }

  async function alEnviar(e: React.FormEvent) {
    e.preventDefault();

    if (enviando) return;

    if (!email.trim() || !password) {
      setError("Completá el email y la contraseña.");
      return;
    }

    setError(null);
    setEnviando(true);

    try {
      await iniciarSesion(email.trim(), password);

      navigate("/ordenes", { replace: true });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo conectar con el servidor.",
      );
      setEnviando(false);
    }
  }

  return (
    <div className="login">
      <div className="login__marca">
        <div className="login__logo">R</div>

        <div className="login__frase">
          <p>Gestioná cada reparación desde un solo lugar.</p>
          <p className="login__frase-2">
            Clientes, equipos y órdenes de servicio — todo el taller en una
            pantalla.
          </p>
        </div>

        <p className="login__pie">Sistema interno de reparaciones</p>
      </div>

      <div className="login__lado">
        <div className="login__caja">
          <h1>Iniciar sesión</h1>
          <p className="login__sub">Ingresá con tu cuenta del taller.</p>

          <form className="login__form" onSubmit={alEnviar}>
            <label>
              Email
              <input
                type="email"
                autoComplete="email"
                placeholder="admin@techfix.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label>
              Contraseña
              <span className="login__clave">
                <input
                  type={verPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="login__ojo"
                  onClick={() => setVerPassword((v) => !v)}
                  aria-label={
                    verPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {verPassword ? "🙈" : "👁"}
                </button>
              </span>
            </label>

            {error && <p className="login__error">{error}</p>}

            <button type="submit" className="login__boton" disabled={enviando}>
              {enviando ? "Ingresando…" : "Ingresar"}
            </button>
          </form>

          <p className="login__ayuda">
            ¿Problemas para entrar? Consultá al administrador.
          </p>
        </div>
      </div>
    </div>
  );
}

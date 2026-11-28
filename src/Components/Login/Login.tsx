import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
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
      <div className="login__caja">
        <div className="login__logo">R</div>

        <h1 className="login__titulo">Iniciar sesión</h1>
        <p className="login__sub">
          Gestioná cada reparación desde un solo lugar.
        </p>

        <form className="login__form" onSubmit={alEnviar}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="admin@techfix.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />

            <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
              <TextField
                fullWidth
                label="Contraseña"
                type={verPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <IconButton
                onClick={() => setVerPassword((v) => !v)}
                aria-label={
                  verPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                sx={{ mt: 0.5 }}
              >
                {verPassword ? "🙈" : "👁"}
              </IconButton>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={enviando}
            >
              {enviando ? "Ingresando…" : "Ingresar"}
            </Button>
          </Stack>
        </form>

        <p className="login__ayuda">
          ¿Problemas para entrar? Consultá al administrador.
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import Modal from "../Modal/Modal";
import { useClienteContext } from "../ClienteContext/ClienteContext";
import type ICliente from "../../Interfaces/ICliente";
import "./AgregarEditarCliente.css";

interface AgregarEditarClienteProps {
  inicial: ICliente | null; // null = alta
  onCerrar: () => void;
}

export default function AgregarEditarCliente({
  inicial,
  onCerrar,
}: AgregarEditarClienteProps) {
  const { agregarCliente, editarCliente } = useClienteContext();

  const [nombre, setNombre] = useState(inicial?.nombre ?? "");
  const [apellido, setApellido] = useState(inicial?.apellido ?? "");
  const [telefono, setTelefono] = useState(inicial?.telefono ?? "");
  const [email, setEmail] = useState(inicial?.email ?? "");
  const [direccion, setDireccion] = useState(inicial?.direccion ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function alGuardar(e: React.FormEvent) {
    e.preventDefault();

    if (guardando) return;

    if (!nombre.trim() || !apellido.trim()) {
      setError("Nombre y apellido son obligatorios.");
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("El email no tiene un formato válido.");
      return;
    }

    // Campos vacíos → null (el DTO del backend los acepta así)
    const datos = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      telefono: telefono.trim() || null,
      email: email.trim() || null,
      direccion: direccion.trim() || null,
    };

    setGuardando(true);
    setError(null);

    try {
      if (inicial) {
        await editarCliente(inicial.id, datos);
      } else {
        await agregarCliente(datos);
      }
      onCerrar();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
      setGuardando(false);
    }
  }

  return (
    <Modal
      titulo={inicial ? "Editar cliente" : "Nuevo cliente"}
      onCerrar={onCerrar}
    >
      <form className="form-cliente" onSubmit={alGuardar}>
        <div className="form-cliente__fila">
          <label>
            Nombre *
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoFocus
            />
          </label>

          <label>
            Apellido *
            <input
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
            />
          </label>
        </div>

        <label>
          Teléfono
          <input
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="11 5555-5555"
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="cliente@correo.com"
          />
        </label>

        <label>
          Dirección
          <input
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Calle y número"
          />
        </label>

        {error && <p className="form-cliente__error">{error}</p>}

        <div className="modal-acciones">
          <button
            type="button"
            className="boton-secundario"
            onClick={onCerrar}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button type="submit" className="boton-primario" disabled={guardando}>
            {guardando
              ? "Guardando…"
              : inicial
                ? "Guardar cambios"
                : "Crear cliente"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

import { useState } from "react";
import Modal from "../Modal/Modal";
import { useEquipoContext } from "../EquipoContext/EquipoContext";
import { useClienteContext } from "../ClienteContext/ClienteContext";
import type { IEquipo, IEquipoInput } from "../../Hooks/useEquiposApi";
import "./AgregarEditarEquipo.css";

interface AgregarEditarEquipoProps {
  inicial: IEquipo | null; // null = alta
  onCerrar: () => void;
}

export default function AgregarEditarEquipo({
  inicial,
  onCerrar,
}: AgregarEditarEquipoProps) {
  const { agregarEquipo, editarEquipo } = useEquipoContext();
  const { clientes } = useClienteContext();

  const [clienteId, setClienteId] = useState<number>(inicial?.clienteId ?? 0);
  const [tipo, setTipo] = useState(inicial?.tipo ?? "");
  const [marca, setMarca] = useState(inicial?.marca ?? "");
  const [modelo, setModelo] = useState(inicial?.modelo ?? "");
  const [numeroSerie, setNumeroSerie] = useState(inicial?.numeroSerie ?? "");
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function alGuardar(e: React.FormEvent) {
    e.preventDefault();

    if (guardando) return;

    if (!clienteId) {
      setError("Seleccioná un cliente.");
      return;
    }

    const datos: IEquipoInput = {
      clienteId,
      tipo: tipo.trim() || null,
      marca: marca.trim() || null,
      modelo: modelo.trim() || null,
      numeroSerie: numeroSerie.trim() || null,
      descripcion: descripcion.trim() || null,
    };

    setGuardando(true);
    setError(null);

    try {
      if (inicial) {
        await editarEquipo(inicial.id, datos);
      } else {
        await agregarEquipo(datos);
      }
      onCerrar();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
      setGuardando(false);
    }
  }

  return (
    <Modal
      titulo={inicial ? "Editar equipo" : "Nuevo equipo"}
      onCerrar={onCerrar}
    >
      <form className="form-equipo" onSubmit={alGuardar}>
        <label>
          Cliente *
          <select
            value={clienteId}
            onChange={(e) => setClienteId(Number(e.target.value))}
            autoFocus
          >
            <option value={0}>Seleccioná un cliente…</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre} {cliente.apellido}
              </option>
            ))}
          </select>
        </label>

        <div className="form-equipo__fila">
          <label>
            Tipo
            <input
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              placeholder="Notebook, PC, Impresora…"
            />
          </label>

          <label>
            Marca
            <input value={marca} onChange={(e) => setMarca(e.target.value)} />
          </label>
        </div>

        <div className="form-equipo__fila">
          <label>
            Modelo
            <input value={modelo} onChange={(e) => setModelo(e.target.value)} />
          </label>

          <label>
            Número de serie
            <input
              value={numeroSerie}
              onChange={(e) => setNumeroSerie(e.target.value)}
            />
          </label>
        </div>

        <label>
          Descripción
          <textarea
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Detalles del equipo, accesorios, estado…"
          />
        </label>

        {error && <p className="form-equipo__error">{error}</p>}

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
                : "Crear equipo"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

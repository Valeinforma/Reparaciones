import { useMemo } from "react";
import { useClienteContext } from "../ClienteContext/ClienteContext";
import Buscador from "../Buscador/Buscador";
import Cliente from "../Cliente/Cliente";
import AgregarEditarCliente from "../AgregarEditarCliente/AgregarEditarCliente";
import ModalEquiposCliente from "../ModalEquiposCliente/ModalEquiposCliente";
import Modal from "../Modal/Modal";
import "./ClientesList.css";

export default function ClientesList() {
  const {
    clientes,
    cargando,
    error,
    obtenerClientes,
    busqueda,
    setBusqueda,
    openModal,
    setOpenModal,
    clienteSeleccionado,
    setClienteSeleccionado,
    clienteAEliminar,
    setClienteAEliminar,
    clienteEquipos,
    setClienteEquipos,
    eliminarCliente,
  } = useClienteContext();


  const clientesVisibles = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) return clientes;

    return clientes.filter((cliente) =>
      [cliente.nombre, cliente.apellido, cliente.email, cliente.telefono]
        .filter((campo): campo is string => Boolean(campo))
        .some((campo) => campo.toLowerCase().includes(termino)),
    );
  }, [clientes, busqueda]);

  function abrirAlta() {
    setClienteSeleccionado(null);
    setOpenModal(true);
  }

  function abrirEdicion(cliente: (typeof clientes)[number]) {
    setClienteSeleccionado(cliente);
    setOpenModal(true);
  }

  async function confirmarEliminacion() {
    if (!clienteAEliminar) return;

    try {
      await eliminarCliente(clienteAEliminar.id);
      setClienteAEliminar(null);
    } catch {

    }
  }

  return (
    <section className="clientes">
      <div className="listado-barra">
        <Buscador
          valor={busqueda}
          onCambio={setBusqueda}
          placeholder="Buscar por nombre, email o teléfono…"
        />

        <button type="button" className="boton-primario" onClick={abrirAlta}>
          + Nuevo cliente
        </button>
      </div>

      {error && clientes.length > 0 && (
        <div className="aviso-error">
          <span>{error}</span>
          <button
            type="button"
            className="boton-secundario"
            onClick={() => obtenerClientes()}
          >
            Reintentar
          </button>
        </div>
      )}

      {cargando && clientes.length === 0 && <p className="estado">Cargando…</p>}

      {!cargando && error && clientes.length === 0 && (
        <div className="estado estado--error">
          <p>{error}</p>
          <button
            type="button"
            className="boton-secundario"
            onClick={() => obtenerClientes()}
          >
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && clientesVisibles.length === 0 && (
        <p className="estado">
          {busqueda
            ? "Ningún cliente coincide con la búsqueda."
            : "Todavía no hay clientes cargados."}
        </p>
      )}

      <div className="grilla">
        {clientesVisibles.map((cliente) => (
          <Cliente
            key={cliente.id}
            cliente={cliente}
            onEditar={() => abrirEdicion(cliente)}
            onEliminar={() => setClienteAEliminar(cliente)}
            onVerEquipos={() => setClienteEquipos(cliente)}
          />
        ))}
      </div>

      {openModal && (
        <AgregarEditarCliente
          inicial={clienteSeleccionado}
          onCerrar={() => setOpenModal(false)}
        />
      )}

      {clienteAEliminar && (
        <Modal
          titulo="Eliminar cliente"
          onCerrar={() => setClienteAEliminar(null)}
        >
          <p>
            ¿Eliminar a{" "}
            <strong>
              {clienteAEliminar.nombre} {clienteAEliminar.apellido}
            </strong>
            ? Esta acción no se puede deshacer.
          </p>

          <div className="modal-acciones">
            <button
              type="button"
              className="boton-secundario"
              onClick={() => setClienteAEliminar(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="boton-peligro"
              onClick={confirmarEliminacion}
            >
              Eliminar
            </button>
          </div>
        </Modal>
      )}

      {clienteEquipos && (
        <ModalEquiposCliente
          cliente={clienteEquipos}
          onCerrar={() => setClienteEquipos(null)}
        />
      )}
    </section>
  );
}

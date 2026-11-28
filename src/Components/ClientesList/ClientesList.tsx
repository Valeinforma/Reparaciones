import { useMemo } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useClienteContext } from "../ClienteContext/ClienteContext";
import Buscador from "../Buscador/Buscador";
import EstadoListado from "../EstadoListado/EstadoListado";
import Cliente from "../Cliente/Cliente";
import AgregarEditarCliente from "../AgregarEditarCliente/AgregarEditarCliente";
import ModalEquiposCliente from "../ModalEquiposCliente/ModalEquiposCliente";

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
    clienteEquipos,
    setClienteEquipos,
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

  // null = alta, con cliente = edición
  function abrirModal(cliente: (typeof clientes)[number] | null) {
    setClienteSeleccionado(cliente);
    setOpenModal(true);
  }

  return (
    <section>
      <div className="listado-barra">
        <Buscador
          valor={busqueda}
          onCambio={setBusqueda}
          placeholder="Buscar por nombre, email o teléfono…"
        />

        <Button variant="contained" onClick={() => abrirModal(null)}>
          + Nuevo cliente
        </Button>
      </div>

      <EstadoListado
        cargando={cargando}
        error={error}
        total={clientes.length}
        visibles={clientesVisibles.length}
        mensajeVacio={busqueda ? "Ningún cliente coincide con la búsqueda." : "Todavía no hay clientes cargados."}
        onReintentar={() => obtenerClientes()}
      />

      <Box className="grilla">
        {clientesVisibles.map((cliente) => (
          <Cliente
            key={cliente.id}
            cliente={cliente}
            onEditar={() => abrirModal(cliente)}
            onVerEquipos={() => setClienteEquipos(cliente)}
          />
        ))}
      </Box>

      {openModal && (
        <AgregarEditarCliente
          inicial={clienteSeleccionado}
          onCerrar={() => setOpenModal(false)}
        />
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

import { useMemo } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useClienteContext } from "../ClienteContext/ClienteContext";
import Buscador from "../Buscador/Buscador";
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

  function abrirAlta() {
    setClienteSeleccionado(null);
    setOpenModal(true);
  }

  function abrirEdicion(cliente: (typeof clientes)[number]) {
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

        <Button variant="contained" onClick={abrirAlta}>
          + Nuevo cliente
        </Button>
      </div>

      {error && clientes.length > 0 && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => obtenerClientes()}
            >
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {cargando && clientes.length === 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {!cargando && error && clientes.length === 0 && (
        <Stack spacing={2} sx={{ alignItems: "center", py: 5 }}>
          <Alert severity="error">{error}</Alert>
          <Button variant="outlined" onClick={() => obtenerClientes()}>
            Reintentar
          </Button>
        </Stack>
      )}

      {!cargando && !error && clientesVisibles.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
          {busqueda
            ? "Ningún cliente coincide con la búsqueda."
            : "Todavía no hay clientes cargados."}
        </Typography>
      )}

      <Box className="grilla">
        {clientesVisibles.map((cliente) => (
          <Cliente
            key={cliente.id}
            cliente={cliente}
            onEditar={() => abrirEdicion(cliente)}
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



export default interface ICliente {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  fechaAlta: string;
  totalEquipos: number;
}

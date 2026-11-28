import TextField from "@mui/material/TextField";

interface BuscadorProps {
  valor: string;
  onCambio: (valor: string) => void;
  placeholder: string;
}

export default function Buscador({
  valor,
  onCambio,
  placeholder,
}: BuscadorProps) {
  return (
    <TextField
      size="small"
      type="search"
      placeholder={placeholder}
      value={valor}
      onChange={(e) => onCambio(e.target.value)}
      sx={{ flex: 1, minWidth: 240, maxWidth: 460 }}
    />
  );
}

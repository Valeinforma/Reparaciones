import "./Buscador.css";

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
    <input
      className="buscador"
      type="search"
      placeholder={placeholder}
      value={valor}
      onChange={(e) => onCambio(e.target.value)}
    />
  );
}

import { createTheme } from "@mui/material/styles";

// Tema de MUI con la paleta oscura de Reparaciones:
// se conservan los colores del proyecto y se adopta la
// estructura visual del repo (tipografía, radios y sombras).
export const tema = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#38bdf8", contrastText: "#0f172a" },
    secondary: { main: "#94a3b8", contrastText: "#0f172a" },
    error: { main: "#f87171" },
    warning: { main: "#fbbf24" },
    info: { main: "#38bdf8" },
    success: { main: "#4ade80" },
    background: { default: "#0f172a", paper: "#1e293b" },
    text: { primary: "#e2e8f0", secondary: "#94a3b8" },
    divider: "rgba(148, 163, 184, 0.2)",
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    h1: {
      fontSize: "3.5rem",
      fontWeight: 500,
      letterSpacing: "-1.68px",
      lineHeight: 1.1,
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 500,
      letterSpacing: "-0.24px",
    },
    h3: {
      fontSize: "1.15rem",
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: "#0f172a" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(148, 163, 184, 0.2)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: "rgba(148, 163, 184, 0.2)" },
      },
    },
  },
});

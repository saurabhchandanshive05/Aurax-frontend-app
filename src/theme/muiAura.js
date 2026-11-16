import { createTheme } from "@mui/material/styles";

/* MUI theme built from the Aura tokens (src/styles/tokens.css). */
const muiAura = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#4fd1e8", contrastText: "#0b2a33" },
    secondary: { main: "#8b7cf6" },
    success: { main: "#3dd68c" },
    warning: { main: "#f4b740" },
    error: { main: "#ff6b6b" },
    background: { default: "#15122e", paper: "#211d45" },
    text: { primary: "#f3f1ff", secondary: "#c9c4e8", disabled: "#9a94c2" },
    divider: "rgba(196, 188, 255, 0.12)",
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Instrument Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    h1: { fontFamily: '"Bricolage Grotesque", "Instrument Sans", sans-serif' },
    h2: { fontFamily: '"Bricolage Grotesque", "Instrument Sans", sans-serif' },
    h3: { fontFamily: '"Bricolage Grotesque", "Instrument Sans", sans-serif' },
    h4: { fontFamily: '"Bricolage Grotesque", "Instrument Sans", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Bricolage Grotesque", "Instrument Sans", sans-serif' },
    h6: { fontFamily: '"Bricolage Grotesque", "Instrument Sans", sans-serif' },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: "none", border: "1px solid rgba(196, 188, 255, 0.12)" } },
    },
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiContainer: { styleOverrides: { root: { paddingLeft: 0, paddingRight: 0 } } },
  },
});

export default muiAura;

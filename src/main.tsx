
  import { createRoot } from "react-dom/client";
  import { BrowserRouter } from "react-router-dom";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import {
    pedirAntecedentes,
    pedirDNI,
    pedirMigraciones,
    pedirPNP,
    pedirRUC,
    pedirSUNEDU,
  } from "./app/api/pide";

  if (import.meta.env.DEV) {
    (window as any).pide = {
      pedirDNI,
      pedirRUC,
      pedirSUNEDU,
      pedirAntecedentes,
      pedirMigraciones,
      pedirPNP,
    };
  }

  createRoot(document.getElementById("root")!).render(
    <BrowserRouter basename="/sirpo">
      <App />
    </BrowserRouter>
  );
  

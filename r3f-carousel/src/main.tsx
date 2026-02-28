import ReactLenis from "lenis/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Experiment7 from "./pages/Experiment7.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReactLenis root options={{ infinite: true, syncTouch: true }} />
    <Experiment7 />
  </StrictMode>
);

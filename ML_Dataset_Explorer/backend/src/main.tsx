// ─── main.tsx ──────────────────────────────────────────────────────────────
// This is the entry point — the first file React runs.
// It mounts our <App /> component into the <div id="root"> in index.html.

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // Tailwind styles

ReactDOM.createRoot(document.getElementById("root")!).render(
  // StrictMode renders components twice in development to catch bugs
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

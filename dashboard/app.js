import React, { useMemo, useState } from "https://esm.sh/react@18";
import ReactDOM from "https://esm.sh/react-dom@18/client";
import { BACKEND_BASE_URL } from "./config.js";

function App() {
  const [domain, setDomain] = useState("");
  const [fromTs, setFromTs] = useState(new Date().toISOString().slice(0, 10));
  const [toTs, setToTs] = useState(new Date().toISOString().slice(0, 10));
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const requestUrl = useMemo(() => {
    const params = new URLSearchParams({
      domain,
      from_ts: fromTs,
      to_ts: toTs,
    });
    return `${BACKEND_BASE_URL}/api/v1/reports/compliance?${params.toString()}`;
  }, [domain, fromTs, toTs]);

  async function onGenerate() {
    setError("");
    setStatus("");
    setResult(null);

    if (!domain) {
      setError("Ingresa el dominio (ej: ejemplo.edu.pe).");
      return;
    }
    if (!token) {
      setError("Ingresa un Bearer token JWT (Supabase Auth).");
      return;
    }

    setLoading(true);
    setStatus("Generando reporte…");
    try {
      const res = await fetch(requestUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.detail || `HTTP ${res.status}`);
      }
      setResult(data);
      setStatus("Reporte listo.");
    } catch (e) {
      setError(e?.message || String(e));
      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  return React.createElement(
    "div",
    { className: "wrap" },
    React.createElement(
      "div",
      { className: "panel" },
      React.createElement("h2", null, "Dashboard Admin (MVP)"),
      React.createElement(
        "label",
        null,
        "Dominio de la institución (.edu.pe, etc.)"
      ),
      React.createElement("input", {
        value: domain,
        onChange: (e) => setDomain(e.target.value),
        placeholder: "ejemplo.edu.pe",
      }),
      React.createElement("label", null, "Desde (ISO date o datetime)"),
      React.createElement("input", {
        value: fromTs,
        onChange: (e) => setFromTs(e.target.value),
      }),
      React.createElement("label", null, "Hasta (ISO date o datetime)"),
      React.createElement("input", {
        value: toTs,
        onChange: (e) => setToTs(e.target.value),
      }),
      React.createElement("label", null, "Bearer JWT (Supabase Auth)"),
      React.createElement("input", {
        value: token,
        onChange: (e) => setToken(e.target.value),
        placeholder: "eyJhbGciOi…",
      }),
      React.createElement(
        "button",
        { onClick: onGenerate, disabled: loading },
        loading ? "Generando…" : "Generar reporte"
      ),
      React.createElement("div", { className: "status" }, status),
      error ? React.createElement("div", { className: "error" }, error) : null,
      result
        ? React.createElement(
            "div",
            { className: "card" },
            React.createElement("h3", null, "Respuesta"),
            React.createElement("pre", null, JSON.stringify(result, null, 2))
          )
        : null
    )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));


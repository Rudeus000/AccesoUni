"""Página HTML para iniciar sesión con Supabase (anon) y obtener un JWT para la extensión."""

from __future__ import annotations

import json
import os

from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter()


@router.get("/extension-login", response_class=HTMLResponse)
def extension_login_page() -> HTMLResponse:
    """
    El usuario entra con correo y contraseña; se muestra el access_token para
    pegarlo en el popup de la extensión (chrome.storage.local.supabase_access_token).
    Requiere SUPABASE_URL y SUPABASE_ANON_KEY en el entorno del servidor.
    """
    url = (os.getenv("SUPABASE_URL") or "").strip()
    anon = (os.getenv("SUPABASE_ANON_KEY") or "").strip()
    if not url or not anon:
        return HTMLResponse(
            content=(
                "<!DOCTYPE html><html lang='es'><meta charset='utf-8'>"
                "<title>AccesoUni · Sesión</title><body>"
                "<h1>Falta configuración</h1>"
                "<p>Defina <code>SUPABASE_URL</code> y <code>SUPABASE_ANON_KEY</code> en el servidor "
                "y reinicie la API.</p></body></html>"
            ),
            status_code=503,
        )

    su = json.dumps(url)
    sa = json.dumps(anon)
    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AccesoUni · Iniciar sesión para la extensión</title>
  <style>
    body {{ font-family: system-ui, Segoe UI, sans-serif; max-width: 36rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.45; }}
    label {{ display: block; margin: 0.75rem 0 0.25rem; }}
    input {{ width: 100%; padding: 0.5rem; box-sizing: border-box; }}
    button {{ margin-top: 1rem; padding: 0.5rem 1rem; cursor: pointer; }}
    .err {{ color: #b91c1c; }}
    .hint {{ color: #334155; font-size: 0.9rem; }}
    #out {{ display: none; margin-top: 1.5rem; }}
    textarea {{ width: 100%; box-sizing: border-box; font-family: ui-monospace, monospace; font-size: 0.8rem; }}
  </style>
</head>
<body>
  <h1>Iniciar sesión</h1>
  <p class="hint">Tras entrar, copie el token y péguelo en el popup de AccesoUni → «Guardar sesión en la extensión».</p>
  <form id="f">
    <label for="email">Correo</label>
    <input id="email" type="email" autocomplete="username" required />
    <label for="password">Contraseña</label>
    <input id="password" type="password" autocomplete="current-password" required />
    <button type="submit">Entrar</button>
  </form>
  <p id="msg" class="err" role="status"></p>
  <div id="out">
    <p><strong>Token de acceso</strong> (trátelo como una contraseña):</p>
    <textarea id="tok" readonly rows="5"></textarea>
    <p><button type="button" id="copy">Copiar token</button></p>
  </div>
  <script type="module">
    const {{ createClient }} = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient({su}, {sa});
    const form = document.getElementById("f");
    const msg = document.getElementById("msg");
    const out = document.getElementById("out");
    const tok = document.getElementById("tok");
    form.addEventListener("submit", async (e) => {{
      e.preventDefault();
      msg.textContent = "";
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const {{ data, error }} = await supabase.auth.signInWithPassword({{ email, password }});
      if (error) {{
        msg.textContent = error.message || "Error al iniciar sesión.";
        return;
      }}
      const token = data.session?.access_token;
      if (!token) {{
        msg.textContent = "No se recibió sesión.";
        return;
      }}
      tok.value = token;
      out.style.display = "block";
    }});
    document.getElementById("copy").addEventListener("click", async () => {{
      try {{
        await navigator.clipboard.writeText(tok.value);
        msg.textContent = "";
        msg.className = "";
        msg.textContent = "Copiado al portapapeles.";
      }} catch {{
        tok.select();
        msg.textContent = "Seleccione el texto y copie manualmente (Ctrl+C).";
      }}
    }});
  </script>
</body>
</html>
"""
    return HTMLResponse(content=html)

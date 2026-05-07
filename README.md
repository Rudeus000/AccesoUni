<div align="center">

<img src="extension/icons/icon128.png" alt="AccesoUni" width="96" height="96" />

# AccesoUni

**Extensión de navegador y backend para mejorar la accesibilidad en portales educativos**  
Accessibility toolkit for university and school websites (Chrome extension + optional API).

<br />

[![Versión](https://img.shields.io/badge/versi%C3%B3n-0.1.0-2ea44f?style=for-the-badge)](https://github.com/Rudeus000/AccesoUni)
[![Licencia](https://img.shields.io/badge/licencia-MIT-blue?style=for-the-badge)](LICENSE)
[![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?style=for-the-badge)](https://fastapi.tiangolo.com/)
[![Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?style=for-the-badge)](https://developer.chrome.com/docs/extensions/mv3/intro/)

<br />

[![Estrella en GitHub](https://img.shields.io/github/stars/Rudeus000/AccesoUni?style=social&label=Estrella%20el%20repo)](https://github.com/Rudeus000/AccesoUni)

</div>

---

## Vista previa

Panel de ajustes **AccesoUni** sobre un portal real (ejemplo: [ELP](https://www.elp.edu.pe/)) y botón flotante de acceso en el sitio.

| Panel de perfiles en la página | Integración discreta en el sitio |
|:-:|:-:|
| ![AccesoUni: panel de accesibilidad](docs/screenshots/accesouni-pane-elp.png) | ![Sitio con botón de accesibilidad AccesoUni](docs/screenshots/sitio-elp-boton-accesibilidad.png) |

> En `docs/screenshots/` también hay una captura de referencia de estilo de README (inspiración de presentación); las imágenes anteriores son del producto en uso.

---

## Qué incluye este repositorio

| Carpeta | Descripción |
|--------|-------------|
| `extension/` | Extensión **Manifest V3** (popup, content script con TypeScript + esbuild, service worker). |
| `backend/` | API **FastAPI** (preferencias, integración Supabase, etc.). |
| `supabase/` | Scripts SQL de esquema y políticas (RLS) de ejemplo. |

---

## Requisitos

- **Node.js** 18+ (para compilar la extensión).
- **Python** 3.11+ y `pip` (para el backend).
- Cuenta/proyecto **Supabase** si vas a usar la API con base de datos (variables en `backend/.env` según `.env.example`).

---

## Extensión (desarrollo)

```bash
cd extension
npm install
npm run build
```

Luego en Chrome/Edge:

1. Abre `chrome://extensions` (o `edge://extensions`).
2. Activa **Modo de desarrollador**.
3. **Cargar extensión sin empaquetar** → selecciona la carpeta `extension/`.

La compilación genera `extension/dist/contentScript.js` (no se versiona; hay que ejecutar `npm run build` tras clonar).

**Atajo útil:** comandos por voz en la pestaña activa → **Alt+Mayús+V** (configurable en el manifest).

---

## Backend (opcional)

```bash
cd backend
python -m venv .venv
# Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env   # y completa las variables
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

No subas nunca `.env` con secretos al repositorio.

---

## Publicar en GitHub (primer push)

Si el remoto ya está vacío en [AccesoUni](https://github.com/Rudeus000/AccesoUni):

```bash
git init
git add .
git commit -m "Primer commit: AccesoUni (extensión, backend y documentación)"
git branch -M main
git remote add origin https://github.com/Rudeus000/AccesoUni.git
git push -u origin main
```

Si GitHub muestra el repo como vacío y `git remote` ya existe, solo ejecuta `git push -u origin main` tras el commit.

---

## Licencia

MIT — véase [LICENSE](LICENSE).

---

<div align="center">

Hecho para **inclusión y aprendizaje** en entornos educativos.

</div>

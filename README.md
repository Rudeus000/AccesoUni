<div align="center">

<img src="extension/icons/icon128.png" alt="AccesoUni" width="96" height="96" />

# AccesoUni

**Extensión de navegador y capa de servicios para accesibilidad en portales educativos**  
Browser extension and service layer for inclusive university and school websites.

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

En `docs/screenshots/` se incluye además material de referencia para la presentación del repositorio.

---

## Estructura del monorepositorio

| Ruta | Rol |
|------|-----|
| `extension/` | Extensión **Manifest V3**: popup, content script (TypeScript, empaquetado con esbuild), service worker. |
| `backend/` | API **FastAPI** (preferencias, integración con Supabase y rutas auxiliares). |
| `supabase/` | Esquema SQL y políticas RLS de referencia. |
| `dashboard/` | Panel web asociado al ecosistema (si aplica a tu despliegue). |

---

## Requisitos de entorno

| Componente | Versión recomendada |
|------------|---------------------|
| Node.js | 18 o superior |
| Python | 3.11 o superior |
| Supabase | Proyecto configurado cuando se utilice persistencia remota |

La extensión no incluye `dist/` en el repositorio; tras clonar hay que ejecutar el build indicado más abajo.

---

## Extensión: build y carga local

Desde `extension/`:

```bash
npm install
npm run build
```

Esto genera `dist/contentScript.js`. Para probar en **Chrome** o **Edge**: `chrome://extensions` → *Modo de desarrollador* → *Cargar descomprimida* → carpeta `extension/`.

Atajo de comandos por voz en la pestaña activa: **Alt+Mayús+V** (definido en `manifest.json`).

---

## API FastAPI

El servicio vive en `backend/`. La plantilla de variables está en [`backend/.env.example`](backend/.env.example); copie ese archivo a `.env` en el mismo directorio y complete los valores según su despliegue. Ese archivo está excluido del control de versiones.

Pasos habituales:

1. Crear un entorno virtual en `backend/` e instalar dependencias: `pip install -r requirements.txt`.
2. Configurar `backend/.env` a partir de `.env.example`.
3. Arrancar el servidor ASGI, por ejemplo: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` con el directorio de trabajo en `backend/`.

La documentación interactiva de la API estará disponible en la ruta `/docs` de su instancia cuando [FastAPI](https://fastapi.tiangolo.com/) la tenga habilitada.

---

## Licencia

MIT — [LICENSE](LICENSE).

---

<div align="center">

Orientado a **inclusión y aprendizaje** en entornos educativos.

</div>

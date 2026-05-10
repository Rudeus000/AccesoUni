# Script embebido AccesoUni (WordPress / Wix)

Misma lógica principal que el **content script** de la extensión: estilos de accesibilidad, perfiles, botón flotante, narración y comandos de voz al mantener pulsado el botón. Pensado para **inyectarse una vez** en el CMS sin pedir al visitante que instale la extensión.

La orientación normativa (contraste, espaciado, reflujo) está resumida en [`wcag-21-aa-guia-accesouni.md`](wcag-21-aa-guia-accesouni.md): el widget **mejora la experiencia**; el cumplimiento WCAG 2.1 AA del sitio sigue dependiendo del tema, contenidos y auditoría.

## Build

Desde `extension/`:

```bash
npm install
npm run build
```

Salida: **`extension/dist/widget.js`** (no se versiona en git; súbalo a su CDN o al servidor).

## Snippet HTML

Coloque el archivo en una URL **HTTPS** y añada **antes de `</body>`** (o en “Custom Code” / pie del sitio). Puede usar **`defer`**: el bootstrap localiza el `<script>` por la URL (`widget.js`).

```html
<script
  src="https://SU-DOMINIO/static/accesouni/widget.js"
  defer
  data-profile="elder"
  data-popup-url=""
  data-api-base=""
  data-site-key=""
></script>
```

### Atributos `data-*` (opcionales)

| Atributo | Ejemplo | Uso |
|----------|---------|-----|
| `data-profile` | `elder`, `child`, `vision`, `custom`, … | Perfil inicial si el usuario no tiene aún preferencias guardadas en este dominio. |
| `data-popup-url` | `https://…/popup.html` | URL del panel de ajustes **hostado** en su servidor. El `popup.html` de la extensión usa APIs de Chrome; para iframe en la web hace falta una variante web o dejar vacío (ver abajo). |
| `data-api-base` | `https://api.ejemplo.com` | Reservado para futuras llamadas públicas (p. ej. configuración por `site-key`). |
| `data-site-key` | `inst_abc` | Identificador público del cliente (si más adelante expone API de configuración). |

## Preferencias en el navegador (embed)

Sin extensión, los ajustes se guardan en **`localStorage`** del dominio del portal, clave interna `accessouni.embed.settings.v1`. Si el usuario borra datos del sitio, se pierden. Otro dominio no comparte esas preferencias.

## Panel de ajustes (`data-popup-url`)

- La extensión abre `popup.html` con `chrome.runtime.getURL`, que **no existe** en un sitio normal.
- Si **`data-popup-url` está vacío**, un clic en el botón **no abre panel**; se anuncia por voz que puede **mantener pulsado** para comandos de voz. Los estilos y atajos en página siguen activos.
- Para un panel completo en web, hace falta una **copia del popup sin dependencias de `chrome.*`** (trabajo aparte) servida en la misma política que permita iframe.

## Demo local en el repositorio

Tras `npm run build` en `extension/`, copie el widget y sirva la carpeta [`web-demo/`](../web-demo/README.md) con un servidor HTTP para probar la misma inyección en una página tipo intranet.

## WordPress

- Plugins tipo **“Insert Headers and Footers”** o el hook `wp_footer` para imprimir el `<script src="…" defer …>`.
- Subir `widget.js` a `wp-content/uploads/…` o a un CDN.

## Wix

- **Custom Code** → añadir al **body**, en todas las páginas, el mismo snippet (requiere plan que permita código personalizado).

## CSP (Content Security Policy)

Si el sitio usa CSP estricta, debe permitir `script-src` hacia el origen donde aloja `widget.js`. El widget inserta una etiqueta `<style>` en el documento para los ajustes visuales (equivalente al fallback de la extensión cuando no usa `insertCSS`).

## Extensión vs embed

| | Extensión | Embed |
|---|-----------|--------|
| Instalación | Usuario instala desde Chrome | Una línea en el CMS |
| CSS | Puede usar `insertCSS` del service worker | Siempre estilo en DOM |
| Almacenamiento | `chrome.storage.sync` | `localStorage` del sitio |
| Mensajes popup | Nativo | Solo si sirven `popup` web |

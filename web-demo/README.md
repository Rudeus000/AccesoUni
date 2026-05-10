# Demo web AccesoUni (ERS v2)

Sitio estático de presentación alineado con la **Especificación de Requerimientos de Software v2** (normativa WCAG 2.1 AA, SUNEDU/MINEDU, Ley 29733, stack FastAPI + Supabase + MV3).

## Contenido

| Archivo | Uso |
|---------|-----|
| `index.html` | Landing con RU01–RU06, CAR y arquitectura. |
| `portal-prueba.html` | Página “intranet” fea a propósito + carga de `assets/widget.js`. |

## Ver la inyección del widget

1. Compilar la extensión (y copiar el widget aquí):

   ```bash
   cd extension
   npm install
   npm run build
   ```

   El `postbuild` copia `dist/widget.js` → `web-demo/assets/widget.js`.

2. Servir **esta carpeta** por HTTP (no uses `file://`):

   ```bash
   cd web-demo
   npx --yes serve . -p 4173
   ```

3. Abrir `http://localhost:4173` y luego **Portal de prueba**. Debe aparecer el FAB AccesoUni; el perfil inicial es `vision` (atributo `data-profile` en el `<script>`).

## Nota sobre el panel (popup)

El `popup.html` de la extensión usa APIs de Chrome. En embed, `data-popup-url` está vacío: el clic en el FAB anuncia por voz que puede usar **mantener pulsado** para comandos de voz; los estilos se aplican igual.

## Enlace roto a Markdown desde `index.html`

El enlace “Guía WCAG (repo)” apunta a `../docs/...md`; solo funciona si sirves el repo completo. Para la demo en `serve` solo de `web-demo/`, use la copia en GitHub o abra el archivo desde el IDE.

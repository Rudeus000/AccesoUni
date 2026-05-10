# AccesoUni — demo web (Next.js)

Front de presentación alineado al **ERS v2** (normativa, RU, CAR, stack) con **Next.js 14**, **Tailwind CSS**, **Framer Motion** y **Radix UI** (menú de escritorio, diálogo móvil, separadores).

## Requisitos

- Node 18+
- `extension/dist/widget.js` generado antes (o se avisa en consola al arrancar).

## Primer uso

1. Compilar el widget (y copia automática a `public/` vía `postbuild` de la extensión):

   ```bash
   cd extension
   npm install
   npm run build
   ```

2. Instalar y levantar la demo:

   ```bash
   cd web-demo
   npm install
   npm run dev
   ```

3. Abrir [http://localhost:4173](http://localhost:4173) y **Portal de prueba** para validar el FAB y los estilos inyectados.

En cada `npm run dev` y `npm run build` de `web-demo` se ejecuta `scripts/sync-widget.mjs`, que copia `../extension/dist/widget.js` → `public/widget.js` si existe.

## Producción

```bash
npm run build
npm start
```

## Estructura

| Ruta | Contenido |
|------|-----------|
| `src/app/page.tsx` | Landing ERS (secciones con animación al scroll). |
| `src/app/portal-prueba/page.tsx` | Intranet simulada + `<Script src="/widget.js" />`. |
| `src/components/SiteHeader.tsx` | Radix `NavigationMenu` + `Dialog` móvil, motion en cabecera. |
| `public/widget.js` | **No versionado**; generado por el build de `extension/`. |

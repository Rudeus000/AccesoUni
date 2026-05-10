# WCAG 2.1 nivel AA — Guía alineada con parámetros visuales y rol de AccesoUni

Este documento resume los **criterios de éxito** citados en la *Guía técnica de accesibilidad visual* (contraste, tipografía, espaciado, reflujo) y clarifica **qué puede apoyar AccesoUni** y **qué sigue siendo responsabilidad del sitio** para aspirar a una auditoría WCAG 2.1 AA seria.

> **Importante:** Un widget o una extensión **no certifica** por sí solos un portal completo. La conformidad se evalúa sobre **URL + plantillas + contenidos**. AccesoUni puede **mejorar la experiencia** y acercar prácticas alineadas con AA; el cumplimiento formal exige revisión del HTML semántico, formularios, PDFs, vídeos, terceros (iframes), etc.

---

## 1. Contraste y luminancia (SC 1.4.3 y 1.4.11)

| Requisito AA | Umbral | Notas de la guía |
|--------------|--------|------------------|
| Texto normal | **4.5:1** | Sin redondear “hacia arriba”: un ratio 4.47:1 **no cumple**. |
| Texto grande | **3:1** | ≥ 18 pt (~24 px) o ≥ 14 pt (~18.67 px) en negrita. |
| Componentes de IU no solo texto | **3:1** | Bordes de controles, estados, foco visible (relacionado con 2.4.7). |
| Gráficos esenciales | **3:1** | Partes críticas del diagrama / icono informativo. |

**AccesoUni:** el modo **alto contraste**, el control de **contraste (%)**, los temas claro/oscuro y filtros ayudan al usuario a **aumentar legibilidad** en muchas páginas; **no sustituye** medir contraste real texto/fondo en cada componente del tema original.

**Sitio / institución:** usar herramientas tipo **WebAIM Contrast Checker**, contrastar texto sobre **imágenes** (scrims ~40–70 % opacidad si la guía lo sugiere), y revisar iconos y bordes.

---

## 2. Redimensionado de texto (SC 1.4.4)

- El contenido debe permitir **zoom hasta 200 %** sin pérdida de contenido ni funcionalidad.

**Guía:** Preferir **`rem` / `em`** en el diseño base del sitio para que la jerarquía escale con las preferencias del usuario.

**AccesoUni:** escala tipográfica vía `html { font-size: calc(100% * …) }` para que **suban los rem/em** del contenido heredado.

**Sitio:** evitar cajas con `overflow: hidden` que corten texto al zoom; evitar que botones o menús desaparezcan.

---

## 3. Espaciado de texto (SC 1.4.12)

Sin pérdida de contenido ni funcionalidad, el usuario debe poder aplicar como mínimo:

| Métrica | Mínimo |
|---------|--------|
| Altura de línea | ≥ **1.5** × tamaño de fuente |
| Espacio tras párrafos | ≥ **2** × tamaño de fuente |
| Espacio entre letras | ≥ **0.12** × tamaño de fuente |
| Espacio entre palabras | ≥ **0.16** × tamaño de fuente |

**Guía:** Evitar `height` fijas en contenedores de texto; usar `min-height` y reflujo natural.

**AccesoUni:** controles de **interlineado**, **espaciado entre letras/palabras** y perfiles (p. ej. lectura cómoda) se acercan a estas necesidades; conviene **probar con marcadores o estilos de usuario** que fuerzan 1.4.12 en páginas piloto.

**Sitio:** corregir layouts que rompan cuando el navegador o CSS custom aumenta espaciado.

---

## 4. Reflujo (SC 1.4.10)

- A **320 px CSS** de ancho (equivale a 1280 px al 400 %), el contenido debe **reflujo en una columna** sin scroll horizontal innecesario (salvo excepciones: mapas, tablas complejas, etc.).

**Sitio:** diseño responsivo real (breakpoints, `max-width`, grid flexible).

**AccesoUni:** no reemplaza un tema fijo de 1200 px; puede coexistir con temas ya responsivos.

---

## 5. Contraste no textual y foco (SC 1.4.11, 2.4.7)

- Estados de **foco** visibles y con contraste suficiente respecto al fondo (la guía advierte del riesgo si se baja opacidad del outline).
- Componentes **inactivos** (disabled) tienen excepción explícita en contraste.

**AccesoUni:** perfil **motor/teclado** refuerza `:focus-visible`; conviene revisar que no quede por debajo de 3:1 sobre fondos claros/oscuros del sitio.

---

## 6. Color no como única pista (SC 1.4.1)

- No usar solo color para transmitir información (enlaces en párrafos: subrayado u otro indicador además del color).

**Sitio:** tema y contenido editorial.

**AccesoUni:** puede complementar con lectura por voz y guías, pero **no corrige** todos los casos de “solo color”.

---

## 7. Tamaño del objetivo táctil (buena práctica / WCAG 2.2 AA)

La guía menciona **44×44 px** como ideal (históricamente asociado a AAA / UX) y la evolución hacia **24×24 px** en AA en WCAG 2.2.

**AccesoUni:** el botón flotante y controles del panel deberían mantener **áreas cómodas** (≥ 44 px donde sea posible).

**Sitio:** enlaces y controles del tema.

---

## 8. Tipografía y fuentes

La guía recomienda fuentes legibles (sans-serif clásicas o especializadas como OpenDyslexic), diferenciación I/l/1 y O/0.

**AccesoUni:** opción **OpenDyslexic** en personalizado.

---

## Checklist rápido para auditoría (antes de decir “cumplimos AA”)

1. **Contraste:** muestrear textos, botones, enlaces, estados hover/focus y piezas sobre imagen.
2. **Zoom 200 % y 400 %:** navegación principal, formularios, tablas, modales.
3. **1.4.12:** aplicar espaciado mínimo y comprobar que no se corta texto.
4. **Teclado:** orden de tabulación, foco visible, sin trampas de foco.
5. **Semántica:** encabezados, landmarks, nombres accesibles, alternativas en imágenes.
6. **Contenido de terceros:** reproductores, chat, mapas (suelen ser focos de fallos).

---

## Cómo usar este documento con clientes (WordPress / Wix / embed)

- Posicionar AccesoUni como **capa de mejora para el usuario** (contraste, tamaño, espaciado, voz, foco).
- Dejar escrito que **la plantilla y el contenido** deben diseñarse ya pensando en WCAG 2.1 AA (o contratar auditoría).
- Ofrecer **lista de verificación** anterior como “pre-auditoría” conjunta.

---

## Referencias normativas

- [WCAG 2.1](https://www.w3.org/TR/WCAG21/) (W3C).
- Criterios citados explícitamente en la guía interna: **1.4.1**, **1.4.3**, **1.4.4**, **1.4.10**, **1.4.11**, **1.4.12**; operabilidad y tamaño de objetivo como práctica recomendada.

---

*Documento generado para alinear el producto AccesoUni con la guía técnica de accesibilidad visual y preparación frente a WCAG 2.1 nivel AA.*

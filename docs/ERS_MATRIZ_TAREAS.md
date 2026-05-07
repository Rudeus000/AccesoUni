# Matriz ERS v2.0 → tareas priorizadas (AccesoUni)

Documento operativo para cerrar brechas frente a la ERS sin modificar el texto de la especificación.  
**Convención:** cada fila es una unidad de trabajo cerrable (issue/ticket). Prioridad: **P0** crítico ruta valor, **P1** alto, **P2** medio, **P3** diferenciador / compliance profundo.

---

## Leyenda rápida

| Sprint sugerido | Enfoque |
|------------------|----------|
| **S1–S2** | Cierre brechas MVP + UX accesible del popup + fiabilidad inyección |
| **S3–S4** | Identidad (Auth) + preferencias nube + admin mínimo |
| **S5–S7** | RU avanzados (voz fina, lector semántico, subtítulos/alerts) |
| **S8+** | SaaS duro (planes, retención, cifrado, rendimiento bundle, PDF firma) |

---

## P0 — Bloqueantes de producto y coherencia con ERS “core”

| ID ERS | Brecha actual | Issue / tarea (título) | Criterio de aceptación (DoD) | Sprint |
|--------|----------------|------------------------|------------------------------|--------|
| RU05 | Sin `letter-spacing` (inter-letra) | **EXT-001** Añadir control y CSS de espaciado entre letras | Popup + `user_preferences` + content aplican `letter-spacing` coherente con %; persiste en sync y API | S1 |
| RU05 / CU02 | Sin preview en tiempo real al mover sliders | **EXT-002** Aplicar preferencias en vivo desde popup (debounce) | Cambios en formulario reflejan en pestaña activa sin pulsar Guardar (opcional toggle “Aplicar al vuelo”) | S1 |
| CU02 FA-01 | Sin sesión: solo sync, sin mensaje FA ni `local` como respaldo claro | **EXT-003** Modo offline: guardar en `chrome.storage.local` + aviso “Inicia sesión para sincronizar” | Guardar sin token escribe local y muestra estado; con token hace PUT | S1 |
| CU02 FA-02 | Sin reintento 60s tras error de red | **EXT-004** Cola de sincronización: reintentar PUT `/preferences` tras fallo | Tras error de red, reintento automático a los 60s y estado visible en popup | S2 |
| RS06 | Preferencias no cargadas desde API al abrir popup | **EXT-005** GET preferencias del usuario al abrir popup (si hay JWT) | Con sesión, formulario se rellena desde backend/Supabase según contrato API | S2 |
| RS05 | Bundle ~1,4 MB vs ERS &lt;50 KB | **EXT-006** [Epic] Reducir peso: axe fuera del hot path o lazy + chunk | Documentar decisión: o bien se cumple presupuesto en build prod, o se actualiza la ERS con nuevo presupuesto (fuera de este archivo) | S2–S8 |
| AQ06 | Popup no auditado Lighthouse/teclado | **EXT-007** Popup 100% teclado + roles/labels + contraste | Lighthouse accessibility ≥95 en `popup.html` o checklist WCAG equivalente documentado | S1 |

---

## P1 — RU01 voz, CU01, trazabilidad

| ID ERS | Brecha actual | Issue / tarea | DoD | Sprint |
|--------|---------------|---------------|-----|--------|
| RU01 / CU01 | Sin umbral confianza ≥0,85 | **EXT-008** Filtrar resultados SpeechRecognition por `confidence` | Solo dispara activación si `confidence >= 0.85` (o configurable); máx. 3 reintentos conservados | S3 |
| CU01 | No se mueve foco a H1 | **EXT-009** Tras activación, `focus()` primer `h1` o `main` | Foco visible en primer encabezado semántico o fallback `document.title` leído | S3 |
| CU01 Post | `activity_logs` voz inconsistente | **EXT-010** Registrar `scan_submitted` o tipo `voice_activation` en backend | Evento persistido con `user_id`, dominio, metadata mínima | S3 |
| RU01 FA-02 | Sin atajo Alt+Shift+A documentado/código | **EXT-011** Atajo de teclado activa misma capa que voz | Comando registrado en manifest `commands` + handler en SW o content | S3 |

---

## P1 — RU02 lector semántico (MVP acotado)

| ID ERS | Brecha actual | Issue / tarea | DoD | Sprint |
|--------|---------------|---------------|-----|--------|
| RU02 | No hay navegación por landmarks | **EXT-012** Modo “outline”: lista landmarks (main, nav, aside) + ir al siguiente | Overlay o panel accesible con teclas; no rompe foco del sitio sin confirmación | S4 |
| RU02 | No hay lectura H1–H6 | **EXT-013** Navegación por headings con Speech / anuncio | Teclas definidas; respeta orden DOM; anuncia etiqueta y texto | S5 |

---

## P1 — RD / auditoría / negocio mínimo

| ID ERS | Brecha actual | Issue / tarea | DoD | Sprint |
|--------|---------------|---------------|-----|--------|
| RD03 | Sin distinción plan/tier en extensión | **API-001** Exponer `plan`/`features` por dominio (endpoint o flag en prefs) | Extensión puede ocultar/mostrar toggles premium según respuesta | S4 |
| RD01 | Solo axe, sin resumen contraste global | **EXT-014** Panel “resumen WCAG” en popup (último scan) | Muestra nº violaciones y top 3 ids; enlace a detalle opcional | S4 |
| RD02 | Sin bloqueo 2.3.1 explícito | **EXT-015** Detectar animaciones con frecuencia peligrosa y forzar `animation: none` | Heurística documentada + tests en 2–3 sitios de ejemplo | S5 |

---

## P2 — RU03 subtítulos, RU04 alertas, CAR03–04

| ID ERS | Brecha actual | Issue / tarea | DoD | Sprint |
|--------|---------------|---------------|-----|--------|
| RU03 / CU03 | Sin overlay subtítulos | **EXT-016** Detectar `video`/`audio` sin `track[kind=captions]` y ofrecer overlay | UI confirmación; overlay posicionado; tamaño/color configurable | S5–S6 |
| RU03 FA | Web Speech no transcribe audio de video (límite técnico) | **EXT-017** Mensaje honesto si audio no capturable + log `compliance_logs`/metadata | Texto de error según CU03 FA-01; registro en backend si existe endpoint | S6 |
| RU04 | Sin alertas visuales por eventos sonoros | **EXT-018** [Spike] Captura `AudioContext` / hooks a notificaciones conocidas | Prototipo en 1 dominio demo + decisión go/no-go | S6 |
| CAR04 | Fuentes ERS (Atkinson, etc.) | **EXT-019** Añadir fuentes open source adicionales (CDN self-hosted en ext) | Opciones en select + carga local compliant MV3 | S2 |

---

## P2 — Backend / Supabase / CU04–CU05

| ID ERS | Brecha actual | Issue / tarea | DoD | Sprint |
|--------|---------------|---------------|-----|--------|
| RS03 / CAR10 | Sin tabla `subscriptions` | **DB-001** Migración `subscriptions` + FK institución + estados | Esquema versionado; RLS básico; encaja con `institutions.status` | S4 |
| CU05 | Sin flujo registro institución | **API-002** Endpoint o flujo “pending_payment” + verificación email | Documentado + Postman/colección o test e2e mínimo | S7 |
| CU04 | Dashboard acotado a HTML estático | **WEB-001** Evolucionar dashboard a app con auth y gráficas mínimas | Lista reportes + descarga PDF + filtros fecha | S4–S5 |
| DF03 / RD04 | PDF con ReportLab, ERS menciona WeasyPrint | **API-003** [Decisión] Mantener ReportLab o migrar tramo a WeasyPrint | Criterio: maquetación/complex vs dependencias; una página ADR en repo | S5 |

---

## P3 — Seguridad, privacidad, SLA (AQ / RE / Ley 29733)

| ID ERS | Brecha actual | Issue / tarea | DoD | Sprint |
|--------|---------------|---------------|-----|--------|
| AQ03 | Email sin cifrar en MVP | **SEC-001** Diseño cifrado campo sensible (Vault/KMS o pgcrypto) | ADR + plan migración; nunca loguear claro | S8 |
| RD05 | Sin retención 12m + anonimización | **DB-002** Job/cron anonimizar logs >12 meses | SQL o función Supabase + registro de ejecución | S8 |
| AQ04 | Sin flujo consentimiento/portabilidad/baja | **OPS-001** Políticas y endpoints “exportar/borrar datos” &lt;72h | Checklist legal + implementación mínima export JSON usuario | S8 |
| AQ05 | SLA 99,5% | **OPS-002** Healthcheck FastAPI + monitorización | `/health` + documentación despliegue (Render/Railway) | S8 |
| DQ02 | Sin DOMPurify en entradas | **API-004** Sanitizar payloads preferencias/metadata | Tests con payloads maliciosos rechazados o escapados | S3 |

---

## Orden sugerido de implementación (backlog corto)

1. EXT-007, EXT-001, EXT-002, EXT-003 (S1)  
2. EXT-004, EXT-005, EXT-019, API-004 (S2)  
3. EXT-008, EXT-009, EXT-010, EXT-011, API-001 (S3)  
4. EXT-012, DB-001, WEB-001 (S4)  
5. EXT-013, EXT-014, EXT-015, API-003 (S5)  
6. EXT-016, EXT-017, EXT-018 (S6)  
7. API-002 (S7)  
8. EXT-006 (épico), SEC-001, DB-002, OPS-001, OPS-002 (S8+)

---

## Cómo usar esta matriz en GitHub / Jira

- Crear **labels**: `ers:RU01`, `ers:RD02`, `area:extension`, `area:backend`, `priority:P0`…  
- Copiar el código **EXT-00n** / **API-00n** como prefijo del título del issue.  
- Vincular cada PR a un issue; en revisión comprobar **DoD** de la columna correspondiente.

---

*Generado como apoyo a la ERS AccesoUni v2.0; la especificación normativa sigue siendo el documento ERS oficial del proyecto.*

/** Perfiles tipo accessiBe; «custom» = ajustes manuales. */
type AccessProfileId =
  | "custom"
  | "seizure"
  | "vision"
  | "adhd"
  | "cognitive"
  | "child"
  | "keyboard"
  | "blind"
  | "elder";

type Settings = {
  contrast: number;
  font_size: number;
  font_family: string;
  line_spacing: number;
  letter_spacing: number;
  word_spacing: number;
  color_mode: string;
  focus_mode: boolean;
  reduce_motion: boolean;
  semantic_reader: boolean;
  visual_alerts: boolean;
  adaptive_auto: boolean;
  /** Botón circular flotante (estilo accessiBe) para abrir el panel en cualquier página. */
  floating_launcher: boolean;
  /**
   * Tras el primer clic o tecla en la página, abre la escucha por voz (sigue haciendo falta permiso de micrófono;
   * no reemplaza el atajo Alt+Mayús+V, ofrece otra forma de dar el gesto sin abrir el panel).
   */
  voice_auto_listen: boolean;
  access_profile: AccessProfileId;
};

type MediaTier = "none" | "mild" | "strong";

type PageAnalysis = {
  mediaTier: MediaTier;
  imgCount: number;
  videoCount: number;
  svgImageLikeCount: number;
  bgImageApproxCount: number;
  /** Recuento heurístico (color/medios/alt); antes basado en axe-core. */
  axeColorRelatedCount: number;
  denseTextBlocks: number;
  smallTextRatio: number;
  lowContrastRatio: number;
  motionHeavy: boolean;
  unlabeledControlCount: number;
};

const DEFAULTS: Settings = {
  contrast: 100,
  font_size: 100,
  font_family: "default",
  line_spacing: 100,
  letter_spacing: 0,
  word_spacing: 0,
  color_mode: "auto",
  focus_mode: false,
  reduce_motion: false,
  semantic_reader: true,
  visual_alerts: true,
  adaptive_auto: true,
  floating_launcher: true,
  voice_auto_listen: false,
  access_profile: "custom",
};

/** Valores guardados sincronizado con popup.js (mantener alineados). */
const ACCESS_PROFILE_PRESET: Record<Exclude<AccessProfileId, "custom">, Omit<Settings, "access_profile" | "floating_launcher">> = {
  seizure: {
    contrast: 100,
    font_size: 100,
    font_family: "default",
    line_spacing: 100,
    letter_spacing: 2,
    word_spacing: 6,
    color_mode: "auto",
    focus_mode: false,
    reduce_motion: true,
    semantic_reader: false,
    visual_alerts: true,
    adaptive_auto: false,
  },
  vision: {
    contrast: 142,
    font_size: 148,
    font_family: "default",
    line_spacing: 152,
    letter_spacing: 8,
    word_spacing: 22,
    color_mode: "high_contrast",
    focus_mode: false,
    reduce_motion: false,
    semantic_reader: false,
    visual_alerts: true,
    adaptive_auto: true,
  },
  adhd: {
    contrast: 100,
    font_size: 100,
    font_family: "default",
    line_spacing: 108,
    letter_spacing: 1,
    word_spacing: 4,
    color_mode: "auto",
    focus_mode: true,
    reduce_motion: true,
    semantic_reader: true,
    visual_alerts: true,
    adaptive_auto: true,
  },
  cognitive: {
    contrast: 112,
    font_size: 128,
    font_family: "default",
    line_spacing: 146,
    letter_spacing: 6,
    word_spacing: 16,
    color_mode: "light",
    focus_mode: true,
    reduce_motion: true,
    semantic_reader: true,
    visual_alerts: true,
    adaptive_auto: true,
  },
  /** Texto grande, pocas distracciones, voz rápida; pensado niños / familias. */
  child: {
    contrast: 106,
    font_size: 132,
    font_family: "default",
    line_spacing: 142,
    letter_spacing: 4,
    word_spacing: 10,
    color_mode: "light",
    focus_mode: true,
    reduce_motion: true,
    semantic_reader: true,
    visual_alerts: true,
    adaptive_auto: true,
    voice_auto_listen: true,
  },
  keyboard: {
    contrast: 108,
    font_size: 108,
    font_family: "default",
    line_spacing: 112,
    letter_spacing: 2,
    word_spacing: 8,
    color_mode: "auto",
    focus_mode: false,
    reduce_motion: false,
    semantic_reader: true,
    visual_alerts: true,
    adaptive_auto: true,
  },
  blind: {
    contrast: 135,
    font_size: 125,
    font_family: "default",
    line_spacing: 140,
    letter_spacing: 8,
    word_spacing: 18,
    color_mode: "high_contrast",
    focus_mode: false,
    reduce_motion: true,
    semantic_reader: true,
    visual_alerts: true,
    adaptive_auto: true,
    /** Menos pasos: el primer clic o tecla en la página puede abrir micrófono (además de Alt+Mayús+V). */
    voice_auto_listen: true,
  },
  elder: {
    contrast: 118,
    font_size: 124,
    font_family: "default",
    line_spacing: 130,
    letter_spacing: 4,
    word_spacing: 12,
    color_mode: "light",
    focus_mode: false,
    reduce_motion: false,
    semantic_reader: false,
    visual_alerts: true,
    adaptive_auto: true,
  },
};

function normalizeAccessProfile(raw: unknown): AccessProfileId {
  const ids: AccessProfileId[] = [
    "custom",
    "seizure",
    "vision",
    "adhd",
    "cognitive",
    "child",
    "keyboard",
    "blind",
    "elder",
  ];
  const s = String(raw ?? "custom") as AccessProfileId;
  return ids.includes(s) ? s : "custom";
}

function mergeAccessProfilePreset(baseFloating: boolean, profile: Exclude<AccessProfileId, "custom">): Settings {
  const p = ACCESS_PROFILE_PRESET[profile];
  return { ...DEFAULTS, ...p, floating_launcher: baseFloating, access_profile: profile };
}

function flattenSettingsForSync(s: Settings): Record<string, string | number | boolean> {
  return {
    contrast: s.contrast,
    font_size: s.font_size,
    font_family: s.font_family,
    line_spacing: s.line_spacing,
    letter_spacing: s.letter_spacing,
    word_spacing: s.word_spacing,
    color_mode: s.color_mode,
    focus_mode: s.focus_mode,
    reduce_motion: s.reduce_motion,
    semantic_reader: s.semantic_reader,
    visual_alerts: s.visual_alerts,
    adaptive_auto: s.adaptive_auto,
    floating_launcher: s.floating_launcher,
    voice_auto_listen: s.voice_auto_listen,
    access_profile: s.access_profile,
  };
}

async function persistSettings(s: Settings): Promise<void> {
  await chrome.storage.sync.set(flattenSettingsForSync(s));
}

const STYLE_ID = "accessouni-style";
const ALERT_STYLE_ID = "accessouni-alert-style";
const ALERT_CONTAINER_ID = "accessouni-visual-alerts";
const READING_MASK_TOP_ID = "accessouni-reading-mask-top";
const READING_MASK_BOTTOM_ID = "accessouni-reading-mask-bottom";
const SEMANTIC_FOCUS_ID = "accessouni-semantic-focus";
const SKIP_LINK_ID = "accessouni-skip-main-link";
const SKIP_LINK_STYLE_ID = "accessouni-skip-style";
/** Host del botón flotante in-page (excluido de lectura de página completa). */
const FAB_HOST_ID = "accessouni-fab-host";
let lastScannedUrl = "";
let lastAxeColorRelatedCount = 0;
/** Preferencias vistas por los atajos Alt+Shift (se actualiza en cada reaplicación). */
let hotkeySettings: Settings = { ...DEFAULTS };
let semanticShortcutsInstalled = false;
let visualAlertObserver: MutationObserver | null = null;
let visualAlertPlayHandler: ((ev: Event) => void) | null = null;
let readingMaskMoveHandler: ((e: Event) => void) | null = null;
let readingMaskResizeHandler: (() => void) | null = null;
let lastReadingMaskY = 0;
let readingMaskTargetY = 0;
let readingMaskSmoothY = -1;
let readingMaskRafId = 0;

let harshVisualMediaIo: IntersectionObserver | null = null;
const warnedHarshMediaKeys = new Set<string>();
/** Evita repetir el mismo aviso en cada mutación DOM. */
let lastPreambleAnnounceKey = "";
/** Una sola narración de bienvenida por URL (sin repetir en cada mutación del DOM). */
let lastAnnouncedLandingHref = "";
/** Refuerzos automáticos en una misma ruta: no se desactivan si el DOM cambia y el análisis cruza el umbral al revés (evita «péndulo» de tipografía). */
const stickyAdaptive = {
  font: false,
  line: false,
  contrast: false,
  motionHeavy: false,
  denseUi: false,
};
function resetStickyAdaptive() {
  stickyAdaptive.font = false;
  stickyAdaptive.line = false;
  stickyAdaptive.contrast = false;
  stickyAdaptive.motionHeavy = false;
  stickyAdaptive.denseUi = false;
}
/** Evita quitar/poner la misma hoja de extensión cuando el CSS efectivo no cambió (menos parpadeo y reflow). */
let lastCommittedExtensionCss = "";
let domMutationReapplyObserver: MutationObserver | null = null;
let mutationReapplyDebounceTimer: number | undefined;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** Evita valores «basura» de sync (ej. cadena «false», que JS trata como verdadero si se usa Boolean directo sobre string). */
function coalesceBool(v: unknown, fallback: boolean): boolean {
  if (typeof v === "boolean") return v;
  if (v === "true") return true;
  if (v === "false") return false;
  if (typeof v === "number") return v !== 0;
  return fallback;
}

async function loadSettings(): Promise<Settings> {
  const sync = await chrome.storage.sync.get([
    "contrast",
    "font_size",
    "font_family",
    "line_spacing",
    "letter_spacing",
    "word_spacing",
    "color_mode",
    "focus_mode",
    "reduce_motion",
    "semantic_reader",
    "visual_alerts",
    "adaptive_auto",
    "floating_launcher",
    "voice_auto_listen",
    "access_profile",
  ]);
  return {
    ...DEFAULTS,
    contrast: Number(sync.contrast ?? DEFAULTS.contrast),
    font_size: Number(sync.font_size ?? DEFAULTS.font_size),
    font_family: String(sync.font_family ?? DEFAULTS.font_family),
    line_spacing: Number(sync.line_spacing ?? DEFAULTS.line_spacing),
    letter_spacing: Number(sync.letter_spacing ?? DEFAULTS.letter_spacing),
    word_spacing: Number(sync.word_spacing ?? DEFAULTS.word_spacing),
    color_mode: String(sync.color_mode ?? DEFAULTS.color_mode),
    focus_mode: coalesceBool(sync.focus_mode, DEFAULTS.focus_mode),
    reduce_motion: coalesceBool(sync.reduce_motion, DEFAULTS.reduce_motion),
    semantic_reader: coalesceBool(sync.semantic_reader, DEFAULTS.semantic_reader),
    visual_alerts: coalesceBool(sync.visual_alerts, DEFAULTS.visual_alerts),
    adaptive_auto: coalesceBool(sync.adaptive_auto, DEFAULTS.adaptive_auto),
    floating_launcher: coalesceBool(sync.floating_launcher, DEFAULTS.floating_launcher),
    voice_auto_listen: coalesceBool(sync.voice_auto_listen, DEFAULTS.voice_auto_listen),
    access_profile: normalizeAccessProfile(sync.access_profile),
  };
}

function collectDomSignals(): {
  imgCount: number;
  videoCount: number;
  svgImageLikeCount: number;
  bgImageApproxCount: number;
} {
  /* Imágenes: etiquetas img + object con SVG (no duplicar img dentro de <picture>). */
  const imgTags = document.querySelectorAll("img").length;
  const svgObjects = document.querySelectorAll('object[type*="image/svg"], object[data*="svg"]').length;
  const imgCount = imgTags + svgObjects;
  const videoCount = document.querySelectorAll("video").length;

  const svgs = Array.from(document.querySelectorAll("svg")).slice(0, 100);
  let svgImageLikeCount = 0;
  for (const node of svgs) {
    const role = node.getAttribute("role");
    const ariaHidden = node.getAttribute("aria-hidden");
    if (ariaHidden === "true") continue;
    try {
      const r = node.getBoundingClientRect();
      if (role === "img" || (r.width >= 56 && r.height >= 56)) svgImageLikeCount += 1;
    } catch {
      // no-op
    }
  }

  /* Muestra de bloques con background-image (banners, héroes) — acotado por coste. */
  let bgImageApproxCount = 0;
  const blockEls = Array.from(
    document.querySelectorAll("div, section, article, header, footer, main, aside, li, figure")
  ).slice(0, 140);
  for (const el of blockEls) {
    try {
      const bi = window.getComputedStyle(el).backgroundImage;
      if (!bi || bi === "none") continue;
      if (bi.includes("gradient(")) continue;
      bgImageApproxCount += 1;
    } catch {
      break;
    }
  }

  return { imgCount, videoCount, svgImageLikeCount, bgImageApproxCount };
}

function parseRgbFromCssColor(value: string): [number, number, number] | null {
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i);
  if (!match) return null;
  if (match[4] !== undefined && parseFloat(match[4]) < 0.06) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function luminance([r, g, b]: [number, number, number]): number {
  const norm = [r, g, b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * norm[0] + 0.7152 * norm[1] + 0.0722 * norm[2];
}

function contrastRatio(fg: [number, number, number], bg: [number, number, number]): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/** Luminancia del fondo de página (respeta transparencias y usa html si body es transparente). */
function pageBackgroundLuminance(): number | null {
  const roots = [document.documentElement, document.body].filter(Boolean) as HTMLElement[];
  for (const el of roots) {
    const rgb = parseRgbFromCssColor(window.getComputedStyle(el).backgroundColor);
    if (rgb) return luminance(rgb);
  }
  return null;
}

function sampleTextQuality() {
  const textNodes = Array.from(
    document.querySelectorAll("p, li, a, button, label, td, th, span, h1, h2, h3, h4")
  ) as HTMLElement[];
  const sample = textNodes.slice(0, 220);
  if (!sample.length) return { denseTextBlocks: 0, smallTextRatio: 0, lowContrastRatio: 0 };

  let small = 0;
  let lowContrast = 0;
  let dense = 0;
  for (const el of sample) {
    const text = el.textContent?.trim() || "";
    if (text.length < 10) continue;
    const cs = window.getComputedStyle(el);
    const fontPx = Number.parseFloat(cs.fontSize || "16");
    const linePx = Number.parseFloat(cs.lineHeight || "0");
    if (fontPx > 0 && fontPx < 15) small += 1;
    if (linePx > 0 && fontPx > 0 && linePx / fontPx < 1.35) dense += 1;

    const fg = parseRgbFromCssColor(cs.color);
    const bg = parseRgbFromCssColor(cs.backgroundColor || "");
    if (fg && bg && contrastRatio(fg, bg) < 4.5) {
      lowContrast += 1;
    }
  }
  const total = Math.max(sample.length, 1);
  return {
    denseTextBlocks: dense,
    smallTextRatio: small / total,
    lowContrastRatio: lowContrast / total,
  };
}

function detectMotionHeavyPage(): boolean {
  const animEls = Array.from(document.querySelectorAll("*")).slice(0, 260) as HTMLElement[];
  let moving = 0;
  for (const el of animEls) {
    const cs = window.getComputedStyle(el);
    if ((cs.animationName && cs.animationName !== "none") || (cs.transitionDuration && cs.transitionDuration !== "0s")) {
      moving += 1;
      if (moving >= 24) return true;
    }
  }
  return false;
}

function countUnlabeledControls(): number {
  const controls = Array.from(document.querySelectorAll("input, select, textarea")) as HTMLElement[];
  let count = 0;
  for (const c of controls.slice(0, 160)) {
    const id = c.getAttribute("id");
    const hasAria = c.hasAttribute("aria-label") || c.hasAttribute("aria-labelledby");
    const hasPlaceholder = c.hasAttribute("placeholder");
    const hasLabel = id ? document.querySelector(`label[for="${id}"]`) : null;
    if (!hasAria && !hasLabel && !hasPlaceholder) count += 1;
  }
  return count;
}

function resolveMediaTier(
  signals: {
    imgCount: number;
    videoCount: number;
    svgImageLikeCount: number;
    bgImageApproxCount: number;
  },
  axeColorHits: number
): MediaTier {
  const mediaScore =
    signals.imgCount +
    signals.videoCount * 2 +
    Math.min(signals.svgImageLikeCount, 28) +
    Math.min(signals.bgImageApproxCount, 14);
  if (mediaScore === 0) return "none";
  if (axeColorHits >= 3 || mediaScore >= 22 || signals.videoCount >= 4) return "strong";
  if (axeColorHits >= 1 || mediaScore >= 7) return "mild";
  return "mild";
}

function buildPageAnalysis(): PageAnalysis {
  const { imgCount, videoCount, svgImageLikeCount, bgImageApproxCount } = collectDomSignals();
  const quality = sampleTextQuality();
  const motionHeavy = detectMotionHeavyPage();
  const unlabeledControlCount = countUnlabeledControls();
  const mediaTier = resolveMediaTier(
    { imgCount, videoCount, svgImageLikeCount, bgImageApproxCount },
    lastAxeColorRelatedCount
  );
  return {
    mediaTier,
    imgCount,
    videoCount,
    svgImageLikeCount,
    bgImageApproxCount,
    axeColorRelatedCount: lastAxeColorRelatedCount,
    denseTextBlocks: quality.denseTextBlocks,
    smallTextRatio: quality.smallTextRatio,
    lowContrastRatio: quality.lowContrastRatio,
    motionHeavy,
    unlabeledControlCount,
  };
}

/** Pista breve para elegir modo de color (solo si el usuario dejó «auto»). */
function colorModeSuggestionLine(settings: Settings, analysis: PageAnalysis): string | null {
  if (settings.color_mode !== "auto") return null;
  const lum = pageBackgroundLuminance();
  if (lum !== null) {
    if (lum < 0.33) {
      return "Fondo oscuro: si el texto cuesta, prueba «Claro» o «Alto contraste» en el panel.";
    }
    if (lum > 0.78) {
      return "Fondo muy claro: si molesta el brillo, prueba «Oscuro» en el panel.";
    }
  }
  if (analysis.lowContrastRatio > 0.16) {
    return "Mucho texto con poco contraste: «Alto contraste» suele ayudar.";
  }
  return null;
}

/** Aviso previo (antes del CSS) sobre medios y colores; respeta visual_alerts. */
function announceAccessibilityPreamble(settings: Settings, analysis: PageAnalysis) {
  if (!settings.visual_alerts) return;

  const colorLine = colorModeSuggestionLine(settings, analysis);

  const mediaLines: string[] = [];
  if (analysis.mediaTier !== "none") {
    const bits: string[] = [];
    if (analysis.imgCount > 0) bits.push(`${analysis.imgCount} imagen${analysis.imgCount > 1 ? "es" : ""}`);
    if (analysis.videoCount > 0) bits.push(`${analysis.videoCount} vídeo${analysis.videoCount > 1 ? "s" : ""}`);
    if (analysis.svgImageLikeCount > 0) {
      bits.push(`${analysis.svgImageLikeCount} gráfico${analysis.svgImageLikeCount > 1 ? "s" : ""} SVG`);
    }
    if (analysis.bgImageApproxCount > 0) {
      bits.push(`~${analysis.bgImageApproxCount} zona${analysis.bgImageApproxCount > 1 ? "s" : ""} con imagen de fondo`);
    }
    mediaLines.push(
      `Se detectaron contenidos visuales (${bits.join(", ")}). Se suavizará color en imágenes y vídeo para reducir fatiga.`
    );
    if (analysis.mediaTier === "strong") {
      mediaLines.push(
        "Aviso: densidad visual alta en esta página. Si algo le molesta a la vista, use el perfil Fotosensibilidad o reduzca contraste desde el panel."
      );
    }
  }

  if (!mediaLines.length && !colorLine) return;

  const key = [
    window.location.href,
    analysis.mediaTier,
    analysis.imgCount,
    analysis.videoCount,
    analysis.svgImageLikeCount,
    analysis.bgImageApproxCount,
    colorLine ?? "",
    settings.color_mode,
    settings.access_profile,
  ].join("|");

  if (key === lastPreambleAnnounceKey) return;
  lastPreambleAnnounceKey = key;

  const message = [`AccesoUni`, ...mediaLines, colorLine].filter(Boolean).join(" — ");
  showVisualAlert(message, analysis.mediaTier === "strong" ? 5200 : 4200);
}

/** Más etiquetas cuando el perfil orienta al lector de pantalla / formularios. */
function adaptiveFieldLabelCap(profile: AccessProfileId): number {
  if (profile === "blind") return 120;
  if (profile === "child") return 80;
  if (profile === "cognitive") return 64;
  if (profile === "keyboard") return 56;
  if (profile === "vision") return 40;
  return 24;
}

function applyAutoFieldLabels(limit = 24): number {
  const fields = Array.from(document.querySelectorAll("input, textarea, select")) as HTMLElement[];
  let patched = 0;
  for (const f of fields) {
    if (patched >= limit) break;
    if (f.hasAttribute("aria-label") || f.hasAttribute("aria-labelledby")) continue;
    const id = f.getAttribute("id");
    if (id && document.querySelector(`label[for="${id}"]`)) continue;
    const ph = f.getAttribute("placeholder");
    const name = f.getAttribute("name");
    const type = f.getAttribute("type");
    const inferred = ph || name || type || "campo de formulario";
    f.setAttribute("aria-label", inferred.replace(/[_-]/g, " ").trim());
    patched += 1;
  }
  return patched;
}

/** Solo perfil «ciegos»: atributo alt ausente donde el sitio omitió texto alternativo (heurística). */
function enrichImagesMissingAltIfBlind(limit: number): number {
  let n = 0;
  const imgs = Array.from(document.querySelectorAll("img")) as HTMLImageElement[];
  for (const img of imgs) {
    if (n >= limit) break;
    if (img.hasAttribute("alt")) continue;
    if (img.getAttribute("role") === "presentation" || img.getAttribute("aria-hidden") === "true") continue;
    const tit = img.getAttribute("title");
    let srcTail = "";
    try {
      const u = img.getAttribute("src") || "";
      srcTail = decodeURIComponent(u.split("/").pop() || "").replace(/\.[^.]+$/, "");
    } catch {
      // no-op
    }
    srcTail = srcTail.replace(/[-_+.]/g, " ").trim().slice(0, 140);
    const altTxt = tit?.trim() || srcTail || "Imagen sin descripción disponible";
    img.setAttribute("alt", altTxt);
    if (!img.hasAttribute("role")) img.setAttribute("role", "img");
    n += 1;
  }
  return n;
}

/** Botones / roles sin nombre expuesto por el proveedor para lectores de pantalla. */
function exposeButtonAccessibleNamesIfBlind(limit: number): number {
  let n = 0;
  const cand = Array.from(
    document.querySelectorAll(
      'button:not([aria-label]):not([aria-labelledby]), [role="button"]:not([aria-label]):not([aria-labelledby]), [role="link"]:not([aria-label]):not([aria-labelledby])'
    )
  ) as HTMLElement[];
  for (const el of cand) {
    if (n >= limit) break;
    const txt = el.textContent?.trim();
    const ttitle = el.getAttribute("title");
    const inferred = txt || ttitle;
    if (!inferred || inferred.length > 420) continue;
    el.setAttribute("aria-label", inferred.replace(/\s+/g, " ").slice(0, 250));
    n += 1;
  }
  return n;
}

function ensureSkipLinkStyles() {
  if (document.getElementById(SKIP_LINK_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = SKIP_LINK_STYLE_ID;
  style.textContent = `
    #${SKIP_LINK_ID} {
      position: fixed;
      left: -99999px;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
      z-index: 2147483630;
      background: #0f172a;
      color: #fff !important;
      padding: 10px 16px !important;
      margin: 0 !important;
      border-radius: 8px !important;
      border: 2px solid #fbbf24 !important;
      font: 700 14px system-ui, sans-serif !important;
      text-decoration: none !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.35);
      clip-path: inset(50%);
      white-space: nowrap;
    }
    #${SKIP_LINK_ID}:focus,
    #${SKIP_LINK_ID}:focus-visible {
      left: 12px !important;
      top: 12px !important;
      width: auto;
      height: auto;
      overflow: visible;
      clip-path: none !important;
    }
  `;
  document.documentElement.appendChild(style);
}

/** Saltar al contenido: perfil navegación teclado. */
function syncKeyboardSkipLink(settings: Settings): boolean {
  document.getElementById(SKIP_LINK_ID)?.remove();
  if (settings.access_profile !== "keyboard") return false;

  let mainZone = document.querySelector('main, [role="main"]') as HTMLElement | null;
  if (!mainZone) mainZone = document.getElementById("main") as HTMLElement | null;
  if (!mainZone) return false;

  ensureSkipLinkStyles();
  if (!mainZone.id) mainZone.id = "accessouni-main-content";

  const a = document.createElement("a");
  a.id = SKIP_LINK_ID;
  a.className = "accessouni-skip-link";
  a.href = `#${CSS.escape(mainZone.id)}`;
  a.textContent = "Ir al contenido principal";
  a.setAttribute("accesskey", "1");
  document.body.insertBefore(a, document.body.firstChild);
  return true;
}

/**
 * CSS alineado con lo que cada perfil promete en el panel (epilepsia, lectura motor, cognitivo, etc.).
 */
function buildAccessibilityProfileCss(p: AccessProfileId): string {
  if (!p || p === "custom") return "";

  if (p === "seizure") {
    return `
    html[data-accessouni-profile="seizure"], html[data-accessouni-profile="seizure"] * {
      scroll-behavior: auto !important;
    }
    html[data-accessouni-profile="seizure"] * {
      animation-play-state: paused !important;
      transition-duration: 0.001ms !important;
    }
    html[data-accessouni-profile="seizure"] blink,
    html[data-accessouni-profile="seizure"] marquee {
      display: none !important;
      visibility: hidden !important;
    }
    html[data-accessouni-profile="seizure"] video {
      filter: var(--accessouni-media-filter) saturate(0.72) brightness(0.92) opacity(0.92) !important;
    }
    html[data-accessouni-profile="seizure"] img,
    html[data-accessouni-profile="seizure"] picture img {
      filter: var(--accessouni-media-filter) saturate(0.72) brightness(0.93) !important;
    }
  `;
  }

  if (p === "vision") {
    return `
    html[data-accessouni-profile="vision"] main a[href]:not(.accessouni-skip-link):not(button),
    html[data-accessouni-profile="vision"] article a[href]:not(.accessouni-skip-link):not(button),
    html[data-accessouni-profile="vision"] body p a[href]:not(.accessouni-skip-link) {
      text-decoration: underline !important;
      text-decoration-thickness: 2px !important;
      text-underline-offset: 3px !important;
      text-underline-position: under !important;
    }
    html[data-accessouni-profile="vision"] p:where(:not(nav *)),
    html[data-accessouni-profile="vision"] li:where(:not(nav *)) {
      hyphens: auto;
      hyphenate-character: '-';
      -webkit-hyphens: auto;
    }
    html[data-accessouni-profile="vision"] main :where(h1, h2, h3, h4),
    html[data-accessouni-profile="vision"] article :where(h1, h2, h3, h4),
    html[data-accessouni-profile="vision"] [role="main"] :where(h1, h2, h3, h4) {
      letter-spacing: 0.04em !important;
      font-weight: 700 !important;
    }
  `;
  }

  if (p === "adhd") {
    return `
    html[data-accessouni-profile="adhd"] iframe[title*="chat" i],
    html[data-accessouni-profile="adhd"] iframe[id*="launcher" i],
    html[data-accessouni-profile="adhd"] [class*="Intercom" i],
    html[data-accessouni-profile="adhd"] [id*="hubspot-conversations-" i],
    html[data-accessouni-profile="adhd"] [class*="zendesk" i] {
      opacity: 0.2 !important;
      filter: saturate(0.4) grayscale(0.5) !important;
      transition: opacity 0.25s ease;
    }
  `;
  }

  if (p === "cognitive" || p === "child") {
    const attr = p === "child" ? "child" : "cognitive";
    return `
    html[data-accessouni-profile="${attr}"] * {
      background-attachment: scroll !important;
    }
    /* Líneas-guía azules: enmarcan visualmente el contenido principal */
    html[data-accessouni-profile="${attr}"] main:first-of-type {
      padding-block: 0.3rem 0.35rem !important;
    }
    html[data-accessouni-profile="${attr}"] main:first-of-type::before,
    html[data-accessouni-profile="${attr}"] main:first-of-type::after {
      content: "" !important;
      display: block !important;
      width: 100% !important;
      height: 3px !important;
      margin-block: 0.5rem !important;
      border-radius: 2px !important;
      background: linear-gradient(90deg, #0d47a1, #0288d1) !important;
      box-shadow: 0 0 0 1px rgba(2, 136, 209, 0.28) !important;
    }
    html[data-accessouni-profile="${attr}"] body:not(:has(main)) [role="main"]:first-of-type {
      padding-block: 0.3rem 0.35rem !important;
    }
    html[data-accessouni-profile="${attr}"] body:not(:has(main)) [role="main"]:first-of-type::before,
    html[data-accessouni-profile="${attr}"] body:not(:has(main)) [role="main"]:first-of-type::after {
      content: "" !important;
      display: block !important;
      width: 100% !important;
      height: 3px !important;
      margin-block: 0.5rem !important;
      border-radius: 2px !important;
      background: linear-gradient(90deg, #0d47a1, #0288d1) !important;
      box-shadow: 0 0 0 1px rgba(2, 136, 209, 0.28) !important;
    }
    html[data-accessouni-profile="${attr}"] body:not(:has(main)):not(:has([role="main"])) #content:first-of-type {
      padding-block: 0.3rem 0.35rem !important;
    }
    html[data-accessouni-profile="${attr}"] body:not(:has(main)):not(:has([role="main"])) #content:first-of-type::before,
    html[data-accessouni-profile="${attr}"] body:not(:has(main)):not(:has([role="main"])) #content:first-of-type::after {
      content: "" !important;
      display: block !important;
      width: 100% !important;
      height: 3px !important;
      margin-block: 0.5rem !important;
      border-radius: 2px !important;
      background: linear-gradient(90deg, #0d47a1, #0288d1) !important;
      box-shadow: 0 0 0 1px rgba(2, 136, 209, 0.28) !important;
    }
    html[data-accessouni-profile="${attr}"] main :where(h1, h2, h3),
    html[data-accessouni-profile="${attr}"] article :where(h1, h2, h3),
    html[data-accessouni-profile="${attr}"] [role="main"] :where(h1, h2, h3) {
      font-weight: 700 !important;
      line-height: 1.25 !important;
    }
    html[data-accessouni-profile="${attr}"] p,
    html[data-accessouni-profile="${attr}"] li,
    html[data-accessouni-profile="${attr}"] blockquote {
      max-width: 68ch !important;
      hyphens: auto !important;
      -webkit-hyphens: auto !important;
    }
    html[data-accessouni-profile="${attr}"] [class*="toast" i],
    html[data-accessouni-profile="${attr}"] [class*="snackbar" i] {
      animation: none !important;
    }
  `;
  }

  if (p === "keyboard") {
    return `
    html[data-accessouni-profile="keyboard"] summary:focus-visible,
    html[data-accessouni-profile="keyboard"] iframe:focus-visible,
    html[data-accessouni-profile="keyboard"] audio:focus-visible,
    html[data-accessouni-profile="keyboard"] :focus-visible {
      outline: 4px solid #fbbf24 !important;
      outline-offset: 3px !important;
      box-shadow: 0 0 0 7px rgba(251,191,36,0.35) !important;
    }
  `;
  }

  if (p === "blind") {
    return `
    html[data-accessouni-profile="blind"] [readonly]:not(pre):not(code) {
      color: inherit !important;
    }
  `;
  }

  if (p === "elder") {
    return `
    html[data-accessouni-profile="elder"] body :is(button, [role="button"], input[type="submit"], input[type="button"], input[type="reset"]) {
      min-height: 2.75rem !important;
      padding-block: 0.62rem !important;
      padding-inline: 1.1rem !important;
    }
    html[data-accessouni-profile="elder"] nav a,
    html[data-accessouni-profile="elder"] nav button {
      min-height: 2.55rem !important;
      padding: 10px 12px !important;
      display: inline-flex !important;
      align-items: center !important;
      box-sizing: border-box !important;
    }
  `;
  }

  return "";
}

function mediaFilterForTier(tier: MediaTier): string {
  if (tier === "none") return "none";
  /* Suaviza brillo y cromas fuertes (fotos, banners, vídeo) sin tocar SVG inline de iconos. */
  if (tier === "mild") return "brightness(0.94) saturate(0.82)";
  return "brightness(0.86) saturate(0.62)";
}

function ensureVisualAlertStyles() {
  if (document.getElementById(ALERT_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = ALERT_STYLE_ID;
  style.textContent = `
    #${ALERT_CONTAINER_ID} {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 2147483646;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding-top: 20px;
      box-sizing: border-box;
    }
    .accessouni-alert {
      pointer-events: none;
      padding: 10px 14px;
      border-radius: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: #fff;
      border: 2px solid #ffd54a;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.35;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.38), 0 0 0 3px rgba(255, 213, 74, 0.35);
      max-width: min(560px, 92vw);
      letter-spacing: 0.02em;
      will-change: opacity, transform;
    }
    .accessouni-flash {
      position: fixed;
      inset: 0;
      border: 10px solid rgba(255, 213, 74, 0.95);
      box-sizing: border-box;
      z-index: 2147483645;
      pointer-events: none;
      animation: accessouni-flash 420ms ease-out forwards;
    }
    @keyframes accessouni-flash {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    @keyframes accessouni-fade {
      0% { opacity: 0; transform: translateY(-8px); }
      12% { opacity: 1; transform: translateY(0); }
      88% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-6px); }
    }
  `;
  document.documentElement.appendChild(style);
}

function getAlertContainer(): HTMLElement {
  let node = document.getElementById(ALERT_CONTAINER_ID);
  if (!node) {
    node = document.createElement("div");
    node.id = ALERT_CONTAINER_ID;
    document.documentElement.appendChild(node);
  }
  return node;
}

function showVisualAlert(message: string, holdMs = 3900) {
  ensureVisualAlertStyles();
  const container = getAlertContainer();
  const badge = document.createElement("div");
  badge.className = "accessouni-alert";
  badge.textContent = message;
  badge.style.opacity = "0";
  badge.style.transform = "translateY(-10px)";
  badge.style.transition = "opacity 220ms ease-out, transform 220ms ease-out";
  container.appendChild(badge);
  window.requestAnimationFrame(() => {
    badge.style.opacity = "1";
    badge.style.transform = "translateY(0)";
  });

  window.setTimeout(() => {
    badge.style.opacity = "0";
    badge.style.transform = "translateY(-8px)";
    window.setTimeout(() => badge.remove(), 320);
  }, holdMs);

  const flash = document.createElement("div");
  flash.className = "accessouni-flash";
  document.documentElement.appendChild(flash);
  window.setTimeout(() => flash.remove(), 500);
}

function teardownVisualAlerts() {
  teardownHarshVisualMediaAlerts();
  visualAlertObserver?.disconnect();
  visualAlertObserver = null;
  if (visualAlertPlayHandler) {
    document.removeEventListener("play", visualAlertPlayHandler, true);
    visualAlertPlayHandler = null;
  }
}

/** Alertas sobre aria-live / audio: sin reinstalar en cada mutación DOM. */
function syncVisualAlerts(settings: Settings) {
  if (!settings.visual_alerts) {
    teardownVisualAlerts();
    return;
  }
  if (visualAlertObserver) return;

  visualAlertObserver = new MutationObserver((mutations) => {
    for (const mut of mutations) {
      const target = mut.target as HTMLElement;
      if (!target) continue;
      const alertHost = target.closest?.('[role="alert"], [aria-live="assertive"], [aria-live="polite"]') as
        | HTMLElement
        | null;
      if (!alertHost) continue;
      const txt = alertHost.textContent?.trim();
      if (!txt) continue;
      showVisualAlert(`Alerta del sitio: ${txt.slice(0, 140)}`);
      break;
    }
  });

  visualAlertObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  visualAlertPlayHandler = (ev: Event) => {
    const el = ev.target as HTMLMediaElement | null;
    if (!el) return;
    if (el instanceof HTMLAudioElement || el instanceof HTMLVideoElement) {
      showVisualAlert("Se detectó audio o vídeo en reproducción", 3400);
    }
  };
  document.addEventListener("play", visualAlertPlayHandler, true);
}

function hashHarshMediaEl(el: Element): string {
  if (el instanceof HTMLImageElement) {
    const src = el.currentSrc || el.src || "";
    return `img:${src.slice(-180)}:${Math.round(el.naturalWidth || 0)}`;
  }
  if (el instanceof HTMLVideoElement) {
    const src = el.currentSrc || el.src || el.querySelector("source")?.getAttribute("src") || "";
    return `vid:${src.slice(-180)}`;
  }
  return `el:${el.tagName}:${(el.className?.toString?.() || "").slice(0, 40)}`;
}

function teardownHarshVisualMediaAlerts() {
  harshVisualMediaIo?.disconnect();
  harshVisualMediaIo = null;
}

/**
 * Cuando hay mucho peso visual en viewport (banner, héroe, vídeo grande), muestra aviso textual.
 */
function syncHarshVisualMediaAlerts(settings: Settings) {
  teardownHarshVisualMediaAlerts();

  const careProfile =
    settings.access_profile === "seizure" ||
    settings.access_profile === "vision" ||
    settings.reduce_motion ||
    settings.access_profile === "adhd" ||
    settings.access_profile === "cognitive" ||
    settings.access_profile === "child" ||
    settings.color_mode === "high_contrast";

  if (!settings.visual_alerts || !careProfile) return;

  const vw = Math.max(window.innerWidth, 1);
  const vh = Math.max(window.innerHeight, 1);

  harshVisualMediaIo = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        const t = en.target as HTMLElement;
        if (!(t instanceof HTMLImageElement) && !(t instanceof HTMLVideoElement)) continue;

        let br: DOMRectReadOnly;
        try {
          br = en.boundingClientRect;
        } catch {
          continue;
        }

        const area = Math.max(br.width * br.height, 0);
        const areaRatio = area / (vw * vh);
        const occupiesHeight = br.height >= vh * 0.36;
        const wideBanner = br.width >= vw * 0.74 && br.height >= vh * 0.2;
        const strongPresence = areaRatio >= 0.16 || occupiesHeight || wideBanner;

        if (!en.isIntersecting || en.intersectionRatio < 0.075 || !strongPresence) continue;

        const key = hashHarshMediaEl(t);
        if (warnedHarshMediaKeys.has(key)) continue;
        warnedHarshMediaKeys.add(key);
        if (warnedHarshMediaKeys.size > 42) warnedHarshMediaKeys.clear();

        const kind =
          t instanceof HTMLVideoElement
            ? "Vídeo grande"
            : (t.src || t.currentSrc || "").match(/\.gif(\?|$)/i)
              ? "GIF animado grande"
              : "Imagen grande";
        showVisualAlert(
          `${kind} ocupando gran parte de la pantalla. El color ya está algo suavizado; aparte la vista si le molesta.`,
          settings.access_profile === "seizure" ? 6500 : 5200
        );
        harshVisualMediaIo?.unobserve(t);
      }
    },
    {
      threshold: [0, 0.12, 0.22, 0.42],
      root: null,
      rootMargin: "0px",
    }
  );

  const imgs = Array.from(document.querySelectorAll("img")).filter((im) => {
    const r = im.getAttribute("role");
    const ah = im.getAttribute("aria-hidden");
    if (ah === "true" || r === "presentation") return false;
    return true;
  }) as HTMLImageElement[];
  for (const im of imgs.slice(0, 55)) harshVisualMediaIo.observe(im);

  const vids = Array.from(document.querySelectorAll("video")) as HTMLVideoElement[];
  for (const v of vids.slice(0, 14)) harshVisualMediaIo.observe(v);
}

/** Banda de lectura: modo enfoque o perfiles con concentración garantizada por preset. */
function wantReadingFocusMask(settings: Settings): boolean {
  if (settings.focus_mode) return true;
  if (settings.access_profile === "adhd" || settings.access_profile === "cognitive" || settings.access_profile === "child")
    return true;
  return false;
}

function teardownReadingMask() {
  if (readingMaskRafId) {
    cancelAnimationFrame(readingMaskRafId);
    readingMaskRafId = 0;
  }
  readingMaskSmoothY = -1;
  document.getElementById(READING_MASK_TOP_ID)?.remove();
  document.getElementById(READING_MASK_BOTTOM_ID)?.remove();
  /* Compat: capa antigua basada en mask-image (algunas páginas la ignoraban y velaban todo). */
  document.getElementById("accessouni-reading-mask")?.remove();
  if (readingMaskMoveHandler) {
    window.removeEventListener("pointermove", readingMaskMoveHandler, true);
    window.removeEventListener("pointerdown", readingMaskMoveHandler, true);
    readingMaskMoveHandler = null;
  }
  if (readingMaskResizeHandler) {
    window.removeEventListener("resize", readingMaskResizeHandler);
    readingMaskResizeHandler = null;
  }
}

function readingMaskBandPx(vh: number): number {
  const prof = document.documentElement.getAttribute("data-accessouni-profile");
  const focused = hotkeySettings.focus_mode;
  const wide = focused || prof === "adhd" || prof === "cognitive" || prof === "child";
  const frac = wide ? 0.32 : 0.25;
  return clamp(vh * frac, 112, 280);
}

/** Color de velo: dos bandas fijas (sin mask-image), evita páginas donde el gradiente no aplica y todo queda gris. */
const READING_MASK_BG = "rgba(14, 16, 28, 0.52)";

function updateReadingMaskGeometry() {
  const topEl = document.getElementById(READING_MASK_TOP_ID) as HTMLDivElement | null;
  const bottomEl = document.getElementById(READING_MASK_BOTTOM_ID) as HTMLDivElement | null;
  if (!topEl || !bottomEl) return;

  const h = Math.max(window.innerHeight, 1);
  const band = readingMaskBandPx(h);
  const y = clamp(lastReadingMaskY, band / 2, h - band / 2);
  const topH = Math.max(0, y - band / 2);
  const bottomStart = Math.min(h, y + band / 2);
  const bottomH = Math.max(0, h - bottomStart);

  topEl.style.height = `${topH}px`;
  topEl.style.opacity = topH < 1 ? "0" : "1";

  bottomEl.style.top = `${bottomStart}px`;
  bottomEl.style.height = `${bottomH}px`;
  bottomEl.style.opacity = bottomH < 1 ? "0" : "1";
}

function stepReadingMaskFromPointer() {
  readingMaskRafId = 0;
  if (!document.getElementById(READING_MASK_TOP_ID)) return;

  if (readingMaskSmoothY < 0) readingMaskSmoothY = readingMaskTargetY;
  const d = readingMaskTargetY - readingMaskSmoothY;
  if (Math.abs(d) < 0.7) readingMaskSmoothY = readingMaskTargetY;
  else readingMaskSmoothY += d * 0.45;

  lastReadingMaskY = readingMaskSmoothY;
  updateReadingMaskGeometry();

  if (Math.abs(readingMaskTargetY - readingMaskSmoothY) > 1.25) {
    readingMaskRafId = window.requestAnimationFrame(stepReadingMaskFromPointer);
  }
}

function kickReadingMaskAnimation() {
  if (!document.getElementById(READING_MASK_TOP_ID)) return;
  if (!readingMaskRafId) readingMaskRafId = window.requestAnimationFrame(stepReadingMaskFromPointer);
}

/**
 * Máscara de lectura TDAH: dos franjas fijas (arriba/abajo) con ventana central clara.
 * Evita depender de CSS mask-image, que en algunos sitios no se aplica y deja toda la pantalla en gris.
 */
function syncReadingFocusMask(settings: Settings) {
  if (!wantReadingFocusMask(settings)) {
    teardownReadingMask();
    return;
  }

  const host = document.body ?? document.documentElement;
  let topEl = document.getElementById(READING_MASK_TOP_ID) as HTMLDivElement | null;
  let bottomEl = document.getElementById(READING_MASK_BOTTOM_ID) as HTMLDivElement | null;

  if (!topEl || !bottomEl) {
    readingMaskTargetY = window.innerHeight * 0.42;
    readingMaskSmoothY = readingMaskTargetY;
    lastReadingMaskY = readingMaskSmoothY;

    topEl = document.createElement("div");
    topEl.id = READING_MASK_TOP_ID;
    topEl.setAttribute("role", "presentation");
    topEl.setAttribute("aria-hidden", "true");
    Object.assign(topEl.style, {
      position: "fixed",
      left: "0",
      right: "0",
      top: "0",
      width: "100%",
      zIndex: "2147483640",
      pointerEvents: "none",
      background: READING_MASK_BG,
      boxSizing: "border-box",
      margin: "0",
      padding: "0",
      border: "none",
    } as Partial<CSSStyleDeclaration>);

    bottomEl = document.createElement("div");
    bottomEl.id = READING_MASK_BOTTOM_ID;
    bottomEl.setAttribute("role", "presentation");
    bottomEl.setAttribute("aria-hidden", "true");
    Object.assign(bottomEl.style, {
      position: "fixed",
      left: "0",
      right: "0",
      width: "100%",
      zIndex: "2147483640",
      pointerEvents: "none",
      background: READING_MASK_BG,
      boxSizing: "border-box",
      margin: "0",
      padding: "0",
      border: "none",
    } as Partial<CSSStyleDeclaration>);

    host.appendChild(topEl);
    host.appendChild(bottomEl);

    readingMaskMoveHandler = (e: Event) => {
      const pe = e as PointerEvent;
      if (typeof pe.clientY !== "number") return;
      readingMaskTargetY = pe.clientY;
      if (readingMaskSmoothY < 0) readingMaskSmoothY = pe.clientY;
      kickReadingMaskAnimation();
    };
    window.addEventListener("pointermove", readingMaskMoveHandler, {
      passive: true,
      capture: true,
    });
    window.addEventListener(
      "pointerdown",
      readingMaskMoveHandler as EventListener,
      { passive: true, capture: true }
    );

    readingMaskResizeHandler = () => {
      kickReadingMaskAnimation();
      updateReadingMaskGeometry();
    };
    window.addEventListener("resize", readingMaskResizeHandler);

    updateReadingMaskGeometry();
  } else {
    updateReadingMaskGeometry();
  }

  kickReadingMaskAnimation();
}

function getSemanticOutline() {
  const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")) as HTMLElement[];
  const landmarks = Array.from(
    document.querySelectorAll("main,nav,aside,header,footer,[role='main'],[role='navigation']")
  ) as HTMLElement[];
  return { headings, landmarks };
}

function ensureFocusable(el: HTMLElement) {
  if (el.tabIndex < 0) el.tabIndex = -1;
}

function focusSemanticTarget(target: HTMLElement | null) {
  if (!target) return;
  ensureFocusable(target);
  target.id = target.id || SEMANTIC_FOCUS_ID;
  target.focus({ preventScroll: false });
  target.scrollIntoView({ behavior: "smooth", block: "center" });
}

function getSemanticOutlineSpeechText(): string {
  const { headings, landmarks } = getSemanticOutline();
  const navPart = buildNavigationSpeechSummary();
  const topHeading = headings[0]?.textContent?.trim();
  const core = topHeading
    ? `Titulo principal: ${topHeading}. Encabezados: ${headings.length}. Regiones: ${landmarks.length}.`
    : `Sin titulo H1 claro. Regiones: ${landmarks.length}.`;
  return [navPart, core].filter(Boolean).join(" ");
}

function readSemanticSummary(opts?: { moveFocus?: boolean }) {
  const moveFocus = opts?.moveFocus !== false;
  const { headings, landmarks } = getSemanticOutline();
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(getSemanticOutlineSpeechText());
  u.lang = "es-ES";
  u.onend = () => {
    if (moveFocus) {
      const target = headings[0] ?? landmarks[0] ?? null;
      if (target) focusSemanticTarget(target as HTMLElement);
    }
  };
  window.speechSynthesis.speak(u);
}

/** Bloques donde conviene una pausa al leer la página completa por voz. */
const FULL_READ_BLOCK_TAGS = new Set([
  "P",
  "LI",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "TR",
  "BR",
  "SECTION",
  "ARTICLE",
  "BLOCKQUOTE",
  "DD",
  "DT",
  "NAV",
  "HEADER",
  "FOOTER",
  "ASIDE",
  "UL",
  "OL",
  "MENU",
  "BUTTON",
  "TD",
  "TH",
]);

/** Nodos DOM propios AccesoUni: no incluirlos al leer la página como si fueran contenido del sitio. */
const IGNORE_ROOT_IDS_FULL_PAGE_READ = new Set([
  FAB_HOST_ID,
  ALERT_CONTAINER_ID,
  SKIP_LINK_ID,
  READING_MASK_TOP_ID,
  READING_MASK_BOTTOM_ID,
]);

function textNodeOutsideOurInjections(node: Node): boolean {
  let el: Element | null = node.parentElement;
  for (let d = 0; el && d < 64; d++, el = el.parentElement) {
    const id = el.id;
    if (id && IGNORE_ROOT_IDS_FULL_PAGE_READ.has(id)) return false;
  }
  return true;
}

function isRoughlyVisibleForMenuRead(el: HTMLElement): boolean {
  let cur: HTMLElement | null = el;
  for (let depth = 0; cur && depth < 18; depth++, cur = cur.parentElement) {
    if (cur.getAttribute("aria-hidden") === "true") return false;
    const st = window.getComputedStyle(cur);
    if (st.display === "none" || st.visibility === "hidden") return false;
  }
  return true;
}

/** Enlaces y botones típicos de cabecera/menú (suelen quedar fuera de <main>). */
function buildNavigationSpeechSummary(maxTotalChars = 2200): string {
  const roots = Array.from(
    document.querySelectorAll(
      "nav,[role='navigation'],[role='menubar'],[role='toolbar'],header [role='menubar'],header,[role='banner'],[role='tablist']"
    )
  ) as HTMLElement[];

  const taken = new Set<string>();
  const phrases: string[] = [];
  let runLen = 0;

  for (const root of roots.slice(0, 14)) {
    const items = root.querySelectorAll(
      'a[href]:not([href="#"]):not([href=""]),button:not([disabled]),[role="menuitem"],[role="menuitemradio"],[role="menuitemcheckbox"],[role="tab"]'
    );
    for (let i = 0; i < items.length; i++) {
      if (runLen >= maxTotalChars) break;
      const el = items[i] as HTMLElement;
      if (!isRoughlyVisibleForMenuRead(el)) continue;
      const aria = el.getAttribute("aria-label")?.trim();
      const title = el.getAttribute("title")?.trim();
      const raw = (aria || title || el.textContent || "").replace(/\s+/g, " ").trim();
      const label = raw.replace(/^[\d.\s]+/, "").trim();
      if (!label || label.length < 2 || label.length > 100) continue;
      const key = label.toLowerCase();
      if (taken.has(key)) continue;
      taken.add(key);
      const add = phrases.length ? `. ${label}` : label;
      if (runLen + add.length > maxTotalChars) break;
      phrases.push(label);
      runLen += add.length;
    }
  }

  if (!phrases.length) return "";
  return `Menu y enlaces de navegacion. ${phrases.slice(0, 72).join(". ")}.`;
}

function isNodeTextuallyVisible(node: Node): boolean {
  let el: Element | null = node.parentElement;
  while (el) {
    if (el instanceof HTMLElement) {
      if (el.getAttribute("aria-hidden") === "true") return false;
      const tag = el.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT" || tag === "TEMPLATE") return false;
      const st = window.getComputedStyle(el);
      if (st.display === "none" || st.visibility === "hidden") return false;
      const op = parseFloat(st.opacity);
      if (!Number.isNaN(op) && op < 0.04) return false;
    }
    el = el.parentElement;
  }
  return true;
}

/** Texto visible en orden de árbol, acotado en longitud (lectura página completa por voz). */
function extractVisibleTextFromRoot(root: HTMLElement, maxChars: number): string {
  const segments: string[] = [];
  let total = 0;
  let prevBlock = false;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const raw = node.textContent;
      if (!raw || !raw.replace(/\s/g, "")) return NodeFilter.FILTER_REJECT;
      if (!textNodeOutsideOurInjections(node)) return NodeFilter.FILTER_REJECT;
      if (!isNodeTextuallyVisible(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const parent = n.parentElement;
    if (!parent) continue;
    const piece = (n.textContent || "").replace(/\s+/g, " ").trim();
    if (!piece) continue;
    const isBlock = FULL_READ_BLOCK_TAGS.has(parent.tagName);
    const spacer = segments.length === 0 ? "" : prevBlock || isBlock ? ". " : " ";
    const add = spacer + piece;
    prevBlock = isBlock;
    if (total + add.length >= maxChars) {
      const rest = Math.max(0, maxChars - total);
      if (rest > 24) segments.push(add.slice(0, rest));
      break;
    }
    segments.push(add);
    total += add.length;
  }
  return segments.join("").replace(/\s+\./g, ".").trim();
}

function chunkTextForSpeech(text: string, maxLen = 380): string[] {
  const t = text.trim();
  if (!t) return [];
  const chunks: string[] = [];
  let start = 0;
  while (start < t.length) {
    let end = Math.min(start + maxLen, t.length);
    if (end < t.length) {
      const cutDot = t.lastIndexOf(". ", end);
      const cutSpace = t.lastIndexOf(" ", end);
      const picked =
        cutDot > start + 100 ? cutDot + 2 : cutSpace > start + 50 ? cutSpace + 1 : end;
      end = Math.max(start + Math.min(maxLen / 4, 80), picked);
    }
    const slice = t.slice(start, end).trim();
    if (slice) chunks.push(slice);
    start = end;
    if (!slice && start >= t.length) break;
    if (!slice && start < t.length) start += 1;
  }
  return chunks;
}

/** Encadena locuciones; cancela cualquier síntesis previa. */
function speakUtteranceQueue(parts: string[], lang = "es-PE"): void {
  const clean = parts.map((x) => x.trim()).filter(Boolean);
  if (!("speechSynthesis" in window) || !clean.length) return;
  window.speechSynthesis.cancel();
  let i = 0;
  const next = () => {
    if (i >= clean.length) return;
    const u = new SpeechSynthesisUtterance(clean[i]);
    i += 1;
    u.lang = lang;
    u.rate = 1;
    u.onend = next;
    u.onerror = next;
    window.speechSynthesis.speak(u);
  };
  next();
}

/** Texto referenciado por aria-labelledby (accesible). */
function resolveAriaLabelledbyText(el: Element): string {
  const raw = el.getAttribute("aria-labelledby")?.trim();
  if (!raw) return "";
  const parts: string[] = [];
  for (const id of raw.split(/\s+/)) {
    if (!id) continue;
    const ref = document.getElementById(id);
    const t = ref?.textContent?.replace(/\s+/g, " ").trim();
    if (t) parts.push(t);
  }
  return parts.join(". ").trim();
}

/** Foco real dentro de shadow DOM abierto. */
function getEffectiveFocusedElement(): HTMLElement | null {
  let el = document.activeElement as HTMLElement | null;
  if (!el) return null;
  for (let d = 0; d < 6 && el?.shadowRoot?.activeElement; d++) {
    el = el.shadowRoot.activeElement as HTMLElement;
  }
  return el;
}

/** Una sola frase: tipo de control + nombre (para Alt+Mayus+F, sin colas largas). */
function describeFocusedElementForSpeech(): string {
  let el = getEffectiveFocusedElement();
  if (!el || el === document.body || el === document.documentElement) {
    return "Foco en la pagina, sin un elemento concreto.";
  }
  if (el.id === FAB_HOST_ID || el.closest(`#${FAB_HOST_ID}`)) {
    return "Boton flotante Acceso Uni.";
  }
  if (el.id === SKIP_LINK_ID) {
    return "Enlace: saltar al contenido principal.";
  }
  if (IGNORE_ROOT_IDS_FULL_PAGE_READ.has(el.id) || el.closest(`#${ALERT_CONTAINER_ID}`)) {
    return "Panel Acceso Uni.";
  }

  const tag = el.tagName.toUpperCase();
  const role = el.getAttribute("role")?.toLowerCase() ?? "";

  let name =
    el.getAttribute("aria-label")?.trim() ||
    resolveAriaLabelledbyText(el) ||
    (el.textContent || "").replace(/\s+/g, " ").trim();

  if (!name && el instanceof HTMLInputElement) {
    name =
      el.placeholder?.trim() ||
      el.value?.trim() ||
      (el.type === "submit" || el.type === "button" ? el.getAttribute("value")?.trim() || "" : "");
  }
  if (!name && el instanceof HTMLTextAreaElement) name = el.placeholder?.trim() || "";
  if (!name && el instanceof HTMLSelectElement) {
    name = el.selectedOptions[0]?.textContent?.replace(/\s+/g, " ").trim() || "";
  }

  if (!name) name = el.getAttribute("title")?.trim() || "";
  if (name.length > 220) name = `${name.slice(0, 217).trim()}…`;

  let kind = "elemento";
  if (tag === "A" || role === "link") kind = "enlace";
  else if (tag === "BUTTON" || role === "button") kind = "boton";
  else if (tag === "INPUT") {
    const t = (el as HTMLInputElement).type;
    if (t === "checkbox") kind = "casilla";
    else if (t === "radio") kind = "opcion";
    else if (t === "search") kind = "busqueda";
    else kind = "campo";
  } else if (tag === "SELECT") kind = "lista";
  else if (tag === "TEXTAREA") kind = "area de texto";
  else if (role === "menuitem" || role === "menuitemradio" || role === "menuitemcheckbox") kind = "opcion de menu";
  else if (role === "tab") kind = "pestana";
  else if (role === "option") kind = "opcion";

  return `${kind}, ${name || "sin etiqueta"}.`;
}

/** Lee solo el elemento con foco (navegacion por teclado: pulse al llegar; evita anunciar cada Tab). */
function readFocusedElementAloud(): void {
  ensureSpeechEscapeToCancel();
  if (!("speechSynthesis" in window)) return;
  speak(describeFocusedElementForSpeech());
}

/** Lee el texto visible de toda la página (incluye cabecera, menús y pie; excluye UI inyectada por AccesoUni). */
function readFullPageAloud(): void {
  if (!("speechSynthesis" in window)) return;
  const root = document.body;
  if (!root) return;
  const navBlock = buildNavigationSpeechSummary();
  const bodyBudget = Math.max(8000, 32000 - navBlock.length - 120);
  const text = extractVisibleTextFromRoot(root, bodyBudget);
  const chunks = chunkTextForSpeech(text, 370);
  if (!chunks.length && !navBlock) {
    speak("No hay texto visible suficiente para leer en esta pagina.");
    return;
  }
  const totalParts = (navBlock ? 1 : 0) + chunks.length;
  const queue: string[] = [
    `Lectura de la pagina visible${
      navBlock ? ", primero menu y cabecera" : ""
    }. Seran unos ${totalParts} fragmentos. Pulse escape para cancelar.`,
  ];
  if (navBlock) queue.push(navBlock);
  queue.push(...chunks);
  speakUtteranceQueue(queue);
}

function describeSingleImageForSpeech(img: HTMLImageElement, ordinal: number): string | null {
  if (
    img.getAttribute("aria-hidden") === "true" &&
    !img.getAttribute("alt")?.trim()
  ) {
    return null;
  }
  if (
    img.getAttribute("role") === "presentation" &&
    !img.getAttribute("alt")?.trim() &&
    !img.getAttribute("aria-label")?.trim()
  ) {
    return null;
  }
  let d =
    img.getAttribute("alt")?.trim() ||
    img.getAttribute("aria-label")?.trim() ||
    img.getAttribute("title")?.trim() ||
    "";
  if (!d) {
    const src = img.getAttribute("src") || "";
    const base = decodeURIComponent(src.split("/").pop()?.split("?")[0] || "").trim();
    const guess = base
      .replace(/\.(png|jpe?g|webp|gif|svg|avif)$/i, "")
      .replace(/[-_+.]+/g, " ")
      .trim();
    if (guess.length >= 2 && guess.length < 180) {
      d = `según nombre de archivo: ${guess}`;
    }
  }
  if (!d) {
    d =
      "sin texto alternativo; no se puede conocer el significado sólo desde la extensión. Conviene que el sitio añada atributo alt.";
  }
  return `Imagen ${ordinal}: ${d}`;
}

/** Narra hasta N imágenes con la información textual que analiza AccesoUni (alt, aria, título o nombre del archivo). */
function readImagesAloud(): void {
  if (!("speechSynthesis" in window)) return;
  const imgs = Array.from(document.querySelectorAll("img")) as HTMLImageElement[];
  const lines: string[] = [];
  let ord = 0;
  for (const img of imgs) {
    if (lines.length >= 55) break;
    const line = describeSingleImageForSpeech(img, ord + 1);
    if (!line) continue;
    lines.push(line);
    ord += 1;
  }
  if (!lines.length) {
    speak("No hay imágenes con información describible en esta página, o están marcadas como decorativas.");
    return;
  }
  speakUtteranceQueue([
    `Narracion de imagenes encontradas por el analizador: ${lines.length} elementos. Pulse escape para cancelar.`,
    ...lines,
  ]);
}

function classifyVoiceReadingIntent(transcript: string): "full" | "images" | null {
  const t = transcript
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const fullPhrases = [
    "leer pantalla",
    "leer la pantalla",
    "lee la pantalla",
    "leer todo",
    "leer la pagina",
    "ler la pagina",
    "ler pagina",
    "leer pagina",
    "leer página",
    "leer texto",
    "leer todo el texto",
    "leer contenido",
    "narrar pantalla",
    "narrar texto",
    "narrar la pagina",
    "narrar pagina",
    "dictar texto",
    "dicter texto",
    "texto de la pantalla",
    "voces leer todo",
    "lei todo",
    "lei la pagina",
  ];
  if (fullPhrases.some((p) => t.includes(p))) return "full";

  const imgPhrases = [
    "describir imagenes",
    "descrivir imagenes",
    "describir imágenes",
    "decir las imagenes",
    "narrar imagenes",
    "narrar imágenes",
    "leer imagenes",
    "leer las imagenes",
    "que hay en las imagenes",
    "analizar imagenes",
    "imagenes de la pagina",
    "fotos de la pagina",
  ];
  if (imgPhrases.some((p) => t.includes(p))) return "images";

  return null;
}

/** Escape cancela la cola larga de locución cuando el lector por voz está activo en ajustes. */
let speechEscapeInstalled = false;
function ensureSpeechEscapeToCancel(): void {
  if (speechEscapeInstalled) return;
  speechEscapeInstalled = true;
  window.addEventListener(
    "keydown",
    (ev: KeyboardEvent) => {
      if (ev.key !== "Escape") return;
      if (!hotkeySettings.semantic_reader) return;
      try {
        if (!("speechSynthesis" in window)) return;
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();
          ev.preventDefault();
          ev.stopPropagation();
        }
      } catch {
        /* noop */
      }
    },
    true
  );
}

function ensureSemanticShortcutListener() {
  if (semanticShortcutsInstalled) return;
  semanticShortcutsInstalled = true;

  window.addEventListener(
    "keydown",
    (ev: KeyboardEvent) => {
      if (!ev.altKey || !ev.shiftKey) return;
      const k = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key.toLowerCase();
      if (k !== "h" && k !== "m" && k !== "t" && k !== "i" && k !== "f") return;
      if (!hotkeySettings.semantic_reader) return;
      ev.preventDefault();
      ev.stopPropagation();

      if (k === "f") {
        readFocusedElementAloud();
        return;
      }

      if (k === "t") {
        readFullPageAloud();
        return;
      }

      if (k === "i") {
        readImagesAloud();
        return;
      }

      if (k === "h") {
        const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")) as HTMLElement[];
        if (!headings.length) {
          speak("No hay encabezados en esta pagina.");
          return;
        }
        const active = document.activeElement as HTMLElement | null;
        const idx = active ? headings.findIndex((h) => h === active || h.contains(active)) : -1;
        const next = headings[(idx + 1 + headings.length) % headings.length];
        focusSemanticTarget(next);
        const text = next.textContent?.trim() || "encabezado sin texto";
        speak(`${next.tagName}. ${text}`);
        return;
      }

      if (k === "m") {
        const main = (document.querySelector("main,[role='main']") as HTMLElement | null) ?? null;
        if (!main) {
          speak("No se encontro zona principal.");
          return;
        }
        focusSemanticTarget(main);
        speak("Zona principal.");
      }
    },
    true
  );
}

/** El CSP de muchas páginas bloquea <style> inyectado; insertCSS del service worker no. */
function commitAccessibilityCss(css: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage({ type: "ACCESSOUNI_INSERT_CSS", css }, (res) => {
        if (chrome.runtime.lastError || !res?.ok) {
          void commitAccessibilityCssFallback(css);
        } else {
          document.getElementById(STYLE_ID)?.remove();
        }
        resolve();
      });
    } catch {
      void commitAccessibilityCssFallback(css);
      resolve();
    }
  });
}

function commitAccessibilityCssFallback(css: string) {
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.documentElement.appendChild(style);
  }
  style.textContent = css;
}

/**
 * Aplica ajustes sin pisar font-size en cada nodo (evita layouts rotos).
 * Devuelve etiquetas de “correcciones” aplicadas para telemetría.
 */
async function applyAccessibility(settings: Settings, analysis: PageAnalysis): Promise<string[]> {
  const corrections: string[] = [];
  hotkeySettings = settings;
  let contrastPct = clamp(settings.contrast, 50, 200);
  let fontPct = clamp(settings.font_size, 80, 200);
  let lineSpacing = clamp(settings.line_spacing, 80, 200);
  const labelCap = adaptiveFieldLabelCap(settings.access_profile);
  const autoPatchedLabels = settings.adaptive_auto ? applyAutoFieldLabels(labelCap) : 0;

  let blindSrEnhancements = 0;
  if (settings.access_profile === "blind") {
    blindSrEnhancements += enrichImagesMissingAltIfBlind(120);
    blindSrEnhancements += exposeButtonAccessibleNamesIfBlind(100);
  }

  const presetLocked = settings.access_profile !== "custom";
  if (settings.adaptive_auto && !presetLocked) {
    if (analysis.smallTextRatio > 0.18) stickyAdaptive.font = true;
    if (stickyAdaptive.font) fontPct = Math.max(fontPct, 112);

    if (analysis.denseTextBlocks > 20) stickyAdaptive.line = true;
    if (stickyAdaptive.line) lineSpacing = Math.max(lineSpacing, 145);

    if (analysis.denseTextBlocks > 20) stickyAdaptive.denseUi = true;

    if (analysis.lowContrastRatio > 0.08) stickyAdaptive.contrast = true;
    if (stickyAdaptive.contrast) contrastPct = Math.max(contrastPct, 118);

    if (analysis.motionHeavy) stickyAdaptive.motionHeavy = true;
    if (stickyAdaptive.motionHeavy) lineSpacing = Math.max(lineSpacing, 140);
  }

  const fontScale = fontPct / 100;
  const lineMult = lineSpacing / 100;
  const letterSpacingEm = clamp(settings.letter_spacing, 0, 12) / 100;
  const wordSpacingEm = clamp(settings.word_spacing, 0, 30) / 100;

  const fontFamily =
    settings.font_family === "OpenDyslexic"
      ? '"OpenDyslexic", system-ui, sans-serif'
      : "inherit";

  const colorMode = settings.color_mode;
  const contrastMult = contrastPct / 100;

  const mediaFilter = mediaFilterForTier(analysis.mediaTier);
  if (analysis.mediaTier !== "none") {
    corrections.push(`media_soften_${analysis.mediaTier}`);
  }

  corrections.push(`root_font_scale_${fontPct}`);
  corrections.push(`line_height_${lineSpacing}`);
  if (settings.adaptive_auto) corrections.push("adaptive_auto");
  if (autoPatchedLabels > 0) corrections.push(`auto_aria_labels_${autoPatchedLabels}`);
  if (blindSrEnhancements > 0) corrections.push(`blind_sr_enhance_${blindSrEnhancements}`);
  if (letterSpacingEm > 0) corrections.push(`letter_spacing_${settings.letter_spacing}`);
  if (wordSpacingEm > 0) corrections.push(`word_spacing_${settings.word_spacing}`);
  if (settings.font_family === "OpenDyslexic") corrections.push("font_opendyslexic_body");

  const userWantsReducedMotion =
    settings.reduce_motion ||
    settings.access_profile === "seizure" ||
    (settings.adaptive_auto && analysis.motionHeavy) ||
    (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  if (userWantsReducedMotion) corrections.push("prefers_reduced_motion");
  if (settings.focus_mode) corrections.push("focus_mode_enabled");
  if (wantReadingFocusMask(settings)) corrections.push("reading_focus_mask");
  if (settings.access_profile !== "custom") corrections.push(`access_profile_${settings.access_profile}`);

  const bg =
    colorMode === "dark" ? "#0d0d0d" : colorMode === "light" ? "#ffffff" : "";
  const fg =
    colorMode === "dark" ? "#f2f2f2" : colorMode === "light" ? "#121212" : "";

  if (colorMode === "dark") corrections.push("theme_dark_body");
  if (colorMode === "light") corrections.push("theme_light_body");
  if (colorMode === "high_contrast") corrections.push("theme_high_contrast_filter");

  /* Contraste del slider: 100% = neutro; <100 suaviza; >100 refuerza. */
  const contrastFilter =
    colorMode === "high_contrast"
      ? `contrast(${clamp(contrastMult * 1.15, 0.9, 1.45)}) saturate(1.05)`
      : `contrast(${clamp(contrastMult, 0.85, 1.35)})`;

  if (colorMode === "auto") {
    document.documentElement.removeAttribute("data-accessouni-mode");
  } else {
    document.documentElement.setAttribute("data-accessouni-mode", colorMode);
  }

  /* Filtros en html: contraste opcional + calma visual (modo enfoque / mover menos color). */
  const rootFilterParts: string[] = [];
  const needsContrastFromSlider =
    colorMode === "high_contrast" || contrastPct < 98 || contrastPct > 102;
  if (needsContrastFromSlider) {
    rootFilterParts.push(contrastFilter);
  }
  const needsGlobalFocusRootFilter =
    settings.focus_mode &&
    settings.access_profile !== "adhd" &&
    settings.access_profile !== "cognitive" &&
    settings.access_profile !== "child";

  if (needsGlobalFocusRootFilter) {
    rootFilterParts.push("saturate(0.52)");
    rootFilterParts.push("brightness(0.9)");
  } else if (
    !presetLocked &&
    colorMode === "auto" &&
    (settings.reduce_motion || (settings.adaptive_auto && analysis.motionHeavy))
  ) {
    rootFilterParts.push("saturate(0.82)");
    rootFilterParts.push("brightness(0.98)");
  }

  if (settings.access_profile === "seizure") {
    rootFilterParts.push("saturate(0.68)");
    rootFilterParts.push("brightness(0.94)");
  }

  const rootFilterCss = rootFilterParts.length ? rootFilterParts.join(" ") : "none";

  const reducedMotionBlock = userWantsReducedMotion
    ? `
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  `
    : "";

  const allowChromeDim =
    (settings.focus_mode &&
      settings.access_profile !== "adhd" &&
      settings.access_profile !== "cognitive" &&
      settings.access_profile !== "child") ||
    (stickyAdaptive.denseUi && settings.adaptive_auto && !presetLocked);

  const focusOutlineCss =
    settings.focus_mode ||
    settings.access_profile === "adhd" ||
    settings.access_profile === "cognitive" ||
    settings.access_profile === "child"
      ? `
    body :focus-visible {
      outline: 3px solid #f59e0b !important;
      outline-offset: 2px !important;
    }
  `
      : "";

  const focusDimChromeCss =
    allowChromeDim
      ? `
    /* Sin header/banner globales: muchos portales meten el hero a pantalla completa ahí → opacidad 0.14 = “todo blanco”. */
    footer, nav, [role="navigation"], [role="contentinfo"],
    aside, [role="complementary"], [aria-label*="publicidad" i], [class*="ad-"], [id*="ad-"],
    [class*="social" i], [class*="redes" i], [id*="cookie" i], [class*="cookie" i],
    [class*="sidebar" i], [id*="sidebar" i] {
      opacity: 0.28 !important;
      filter: saturate(0.5) brightness(0.94) !important;
      transition: opacity 140ms ease, filter 140ms ease;
    }
    footer:hover, nav:hover, aside:hover,
    [role="complementary"]:hover, [role="navigation"]:hover {
      opacity: 0.65 !important;
      filter: saturate(0.7) brightness(0.98) !important;
    }
  `
      : "";

  /** Ancho de lectura solo donde no rompe cabeceras/menús (TDAH y teclado quedan con layout “de fábrica”). */
  const readingMeasureCss =
    settings.access_profile === "cognitive" ||
    settings.access_profile === "child" ||
    settings.access_profile === "elder" ||
    (settings.access_profile === "custom" && settings.focus_mode)
      ? `
    main :where(p, li, blockquote),
    article :where(p, li, blockquote),
    [role="main"] :where(p, li, blockquote) {
      max-width: min(72ch, 100%) !important;
      box-sizing: border-box;
    }
  `
      : "";

  const focusModeCss = `${focusDimChromeCss}${focusOutlineCss}${readingMeasureCss}`;

  let profileEnhancementCss = buildAccessibilityProfileCss(settings.access_profile);

  if (settings.access_profile !== "custom") {
    document.documentElement.setAttribute("data-accessouni-profile", settings.access_profile);
  } else {
    document.documentElement.removeAttribute("data-accessouni-profile");
  }

  const css = `
    :root {
      --accessouni-font-scale: ${fontScale};
      --accessouni-line-height-mult: ${lineMult};
      --accessouni-body-font: ${fontFamily};
      --accessouni-media-filter: ${mediaFilter};
      --accessouni-letter-spacing: ${letterSpacingEm}em;
      --accessouni-word-spacing: ${wordSpacingEm}em;
    }
    /* Escala tipográfica global vía raíz (rem/em heredan); no forzar tamaño en cada * */
    html {
      font-size: calc(100% * var(--accessouni-font-scale)) !important;
      filter: ${rootFilterCss};
    }
    body {
      line-height: var(--accessouni-line-height-mult) !important;
      font-family: var(--accessouni-body-font) !important;
    }
    p, li, a, span, td, th, label, input, textarea, button {
      letter-spacing: var(--accessouni-letter-spacing) !important;
      word-spacing: var(--accessouni-word-spacing) !important;
    }
    img, video, picture img {
      filter: var(--accessouni-media-filter) !important;
    }
    ${bg ? `html[data-accessouni-mode="dark"] body, html[data-accessouni-mode="light"] body { background: ${bg} !important; color: ${fg} !important; }` : ""}
    ${reducedMotionBlock}
    ${focusModeCss}
    ${profileEnhancementCss}
  `;

  announceAccessibilityPreamble(settings, analysis);
  if (css !== lastCommittedExtensionCss) {
    await commitAccessibilityCss(css);
    lastCommittedExtensionCss = css;
  }

  syncVisualAlerts(settings);
  syncHarshVisualMediaAlerts(settings);
  syncReadingFocusMask(settings);
  syncFloatingLauncher(settings);

  if (syncKeyboardSkipLink(settings)) corrections.push("keyboard_skip_link");

  return corrections;
}

async function pauseDomObserverAndApplyAccessibility(settings: Settings): Promise<string[]> {
  domMutationReapplyObserver?.disconnect();
  try {
    const analysis = buildPageAnalysis();
    const corrections = await applyAccessibility(settings, analysis);
    notifyVoiceLandingIfNeeded(settings, analysis);
    return corrections;
  } finally {
    if (domMutationReapplyObserver && document.documentElement) {
      domMutationReapplyObserver.observe(document.documentElement, { childList: true, subtree: true });
    }
  }
}

async function sendScanToBackend(payload: {
  domain: string;
  url: string;
  errors_detected: string[];
  corrections_applied: string[];
  wcag_score: number;
  session_id: string;
}) {
  const local = await chrome.storage.local.get(["supabase_access_token"]);
  const token = local.supabase_access_token;
  let backendBaseUrl = "";
  try {
    const res = await chrome.runtime.sendMessage({ type: "ACCESSOUNI_BACKEND_BASE" });
    if (typeof res?.backendBaseUrl === "string") backendBaseUrl = res.backendBaseUrl;
  } catch {
    return;
  }

  if (!backendBaseUrl || !token) return;

  await fetch(`${backendBaseUrl}/api/v1/audit/scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      domain: payload.domain,
      url: payload.url,
      errors_detected: payload.errors_detected,
      corrections_applied: payload.corrections_applied,
      wcag_score: payload.wcag_score,
      session_id: payload.session_id,
    }),
  });
}

function speak(text: string) {
  try {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    // no-op
  }
}

/** Nombre del perfil para locución (lector de pantalla / voz del sistema). */
function profileVoiceLabel(p: AccessProfileId): string {
  switch (p) {
    case "seizure":
      return "fotosensibilidad y convulsiones";
    case "vision":
      return "personas con poca visión";
    case "adhd":
      return "TDAH y concentración";
    case "cognitive":
      return "discapacidad cognitiva y concentración";
    case "child":
      return "ninos y familias";
    case "keyboard":
      return "teclado y movilidad";
    case "blind":
      return "lector de pantalla";
    case "elder":
      return "adultos mayores";
    default:
      return "personalizado, según sus controles";
  }
}

function estimateImageAltCoverage(): { total: number; missingAlt: number; decorative: number } {
  const imgs = Array.from(document.querySelectorAll("img"));
  let decorative = 0;
  let missingAlt = 0;
  for (const img of imgs.slice(0, 80)) {
    if (img.getAttribute("aria-hidden") === "true" || img.getAttribute("role") === "presentation") {
      decorative += 1;
      continue;
    }
    const alt = img.getAttribute("alt");
    if (alt === null || alt.trim() === "") missingAlt += 1;
  }
  return { total: imgs.length, missingAlt, decorative };
}

function countSvgRoleImgMissingAccessibleName(limit: number): number {
  let bad = 0;
  const svgs = Array.from(document.querySelectorAll('svg[role="img"]')).slice(0, limit);
  for (const svg of svgs) {
    const labelled =
      svg.getAttribute("aria-label")?.trim() ||
      svg.getAttribute("aria-labelledby") ||
      svg.querySelector(":scope > title")?.textContent?.trim();
    if (!labelled) bad += 1;
  }
  return bad;
}

/**
 * Sustituto liviano del barrido completo axe-core (~500KiB minificado): alimenta `mediaTier` y telemetría con señales locales.
 */
function runHeuristicColorAccessibilitySignals(): { colorRelatedSignals: number; auditHints: string[] } {
  const auditHints: string[] = [];
  const q = sampleTextQuality();
  let colorRelatedSignals = 0;

  if (q.lowContrastRatio > 0.08) {
    auditHints.push(
      `heuristic/color-contrast: ~${(q.lowContrastRatio * 100).toFixed(0)}% del texto muestreado con bajo contraste`
    );
    colorRelatedSignals += 1;
  }
  if (q.lowContrastRatio > 0.22) {
    colorRelatedSignals += 1;
  }

  const imgInfo = estimateImageAltCoverage();
  if (imgInfo.missingAlt >= 1) {
    auditHints.push(`heuristic/image-alt: ${imgInfo.missingAlt} imagen(es) sin alternativa textual clara`);
    colorRelatedSignals += 1;
  }
  if (imgInfo.missingAlt >= 8) {
    colorRelatedSignals += 1;
  }

  const svgBad = countSvgRoleImgMissingAccessibleName(48);
  if (svgBad >= 1) {
    auditHints.push(`heuristic/svg-img-alt: ${svgBad} svg role=img sin nombre accesible claro`);
    colorRelatedSignals += 1;
  }

  colorRelatedSignals = Math.min(colorRelatedSignals, 6);
  return { colorRelatedSignals, auditHints };
}

/** Instrucciones cortas al hablar; perfil «ciegos» (se repite donde haga falta). */
function buildBlindVoiceHotkeySentence(settings: Settings): string {
  const vox =
    settings.voice_auto_listen
      ? "Comandos por voz: Alt, shift y ve. O cualquier clic o primera tecla en la pagina cuando no este escribiendo en un cuadro. "
      : "Comandos por voz: pulse Alt, shift y ve. ";
  return (
    vox +
    "Luego diga por ejemplo «leer pantalla», «describe imagenes», o «pare» para cortar. " +
    "Teclas rapidas ayuda: Alt shift te lee pagina completa; Alt shift efe dice el elemento enfocado."
  );
}

/** Texto claro y amable para modo niños (no técnico). */
function buildChildFriendlyVoiceIntro(settings: Settings): string {
  const auto =
    settings.voice_auto_listen
      ? "Haz un clic o pulsa una tecla en la pagina cuando no este el cursor en un cuadro de escritura: asi puedes hablar con AccesoUni. "
      : "Un adulto puede pulsar juntas las teclas Alt, shift y ve, para usar la voz. ";
  return (
    auto +
    "Prueba a decir «leer pantalla» para oir el texto en voz alta. Si se oye demasiado rato, di «pare». "
  );
}

/**
 * Tras cambiar perfil desde el panel: resume por voz lo que hay en la página (clave para quien no ve la pantalla).
 */
function announceVoiceAfterProfileApply(settings: Settings, analysis: PageAnalysis): void {
  if (!("speechSynthesis" in window)) return;

  try {
    const label = profileVoiceLabel(settings.access_profile);
    const { headings, landmarks } = getSemanticOutline();
    const linkN = document.querySelectorAll("a[href]").length;
    const fieldN = document.querySelectorAll("input, textarea, select").length;
    const imgInfo = estimateImageAltCoverage();

    const tier =
      analysis.mediaTier === "strong"
        ? "alta"
        : analysis.mediaTier === "mild"
          ? "media"
          : "baja";

    let line1: string;
    if (settings.access_profile === "blind") {
      line1 = "Te damos la bienvenida. AccesoUni. Perfil lector de pantalla. ";
      line1 += buildBlindVoiceHotkeySentence(settings);
      line1 += `${headings.length} encabezados, ${landmarks.length} regiones. `;
      if (imgInfo.missingAlt >= 1) {
        line1 += `Puede haber imagenes sin descripcion clara. `;
      }
      line1 += "Ahora, titulo y estructura.";
    } else if (settings.access_profile === "child") {
      line1 = "Hola. AccesoUni en modo amigable para ninos y familias. ";
      line1 += buildChildFriendlyVoiceIntro(settings);
      line1 += `En esta pagina hay ${headings.length} titulos y ${landmarks.length} bloques. `;
      if (analysis.imgCount >= 1) {
        line1 += `Y ${analysis.imgCount} imagenes aproximadas. `;
      }
      line1 += "Seguimos con el titulo principal y el menu.";
    } else {
      line1 = `AccesoUni. Perfil ${label}. `;
      line1 += `Contenido visual aproximado: ${analysis.imgCount} imágenes, ${analysis.videoCount} vídeos, densidad ${tier}. `;
      line1 += `${headings.length} encabezados, ${landmarks.length} regiones, unos ${Math.min(linkN, 999)} enlaces, ${Math.min(fieldN, 200)} campos de formulario aproximados. `;

      if (settings.semantic_reader) {
        line1 += `Del árbol de la página, hay ${imgInfo.total} elementos imagen; `;
        line1 += `${imgInfo.missingAlt} podrían no tener descripción clara antes de los ajustes. `;
        line1 += "A continuacion el titular principal y la estructura.";
      } else if (settings.access_profile === "vision") {
        line1 += `Se detectaron ${imgInfo.total} imágenes en el documento.`;
      }

      line1 = line1.slice(0, 520);
    }

    const wantStructure = settings.access_profile === "blind" || settings.semantic_reader;
    const moveAfter = settings.access_profile === "blind";

    window.speechSynthesis.cancel();
    const intro = new SpeechSynthesisUtterance(line1);
    intro.lang = "es-ES";

    if (!wantStructure) {
      window.speechSynthesis.speak(intro);
      return;
    }

    intro.onend = () => {
      const structural = new SpeechSynthesisUtterance(getSemanticOutlineSpeechText());
      structural.lang = "es-ES";
      structural.onend = () => {
        if (moveAfter && headings[0]) focusSemanticTarget(headings[0]);
        else if (moveAfter && landmarks[0]) focusSemanticTarget(landmarks[0]);
      };
      window.speechSynthesis.speak(structural);
    };
    window.speechSynthesis.speak(intro);
  } catch {
    speak("AccesoUni. Perfil aplicado.");
  }
}

/** Primera vista de cada URL: narración si el usuario dejó «Narración y lector semántico» activo. */
function notifyVoiceLandingIfNeeded(settings: Settings, analysis: PageAnalysis): void {
  if (!settings.semantic_reader) return;
  if (!("speechSynthesis" in window)) return;
  const href =
    `${window.location.origin}${window.location.pathname}${window.location.search}`.split("#")[0] || "";
  if (!href) return;
  if (lastAnnouncedLandingHref === href) return;
  lastAnnouncedLandingHref = href;
  window.setTimeout(() => {
    announceVoiceAfterProfileApply(settings, buildPageAnalysis());
  }, 680);
}

async function scanAccessibilityAndReport() {
  const currentUrl = window.location.href;
  if (currentUrl === lastScannedUrl) return;

  const { colorRelatedSignals, auditHints } = runHeuristicColorAccessibilitySignals();

  lastScannedUrl = currentUrl;

  lastAxeColorRelatedCount = colorRelatedSignals;

  const settings = await loadSettings();
  const corrections_applied = await pauseDomObserverAndApplyAccessibility(settings);

  const wcag_score = clamp(100 - auditHints.length * 10, 0, 100);

  const session_id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const domain = window.location.hostname;

  await sendScanToBackend({
    domain,
    url: window.location.href,
    errors_detected: auditHints,
    corrections_applied,
    wcag_score,
    session_id,
  });
}

/** Activa preset «ciegos» vía voz y persiste igual que los demás perfiles. */
async function applyBlindVoiceProfileAndReapply(): Promise<void> {
  const prev = await loadSettings();
  const next = mergeAccessProfilePreset(prev.floating_launcher, "blind");
  await persistSettings(next);
  hotkeySettings = next;
  await pauseDomObserverAndApplyAccessibility(next);
  speak(`Perfil lector de pantalla activado. ${buildBlindVoiceHotkeySentence(next)}`);
  if (next.semantic_reader) readSemanticSummary();
  lastScannedUrl = "";
  void scanAccessibilityAndReport();
}

async function applyStandardVoiceActivation(): Promise<void> {
  const s = await loadSettings();
  hotkeySettings = s;
  await pauseDomObserverAndApplyAccessibility(s);
  speak("AccesoUni activado");
  if (s.semantic_reader) readSemanticSummary();
  lastScannedUrl = "";
  void scanAccessibilityAndReport();
}

type VoiceActivatedProfile = "blind" | "standard";

function classifyVoiceShutoff(transcript: string): boolean {
  const raw = transcript.trim().toLowerCase();
  const t = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const pad = ` ${t.replace(/\s+/g, " ").trim()} `;
  const stops = [
    " pare ",
    " parar ",
    " cancelar ",
    " silencio ",
    " stop ",
    " basta ",
    " ya basta ",
    " no mas ",
    " acabo ",
    " terminamos ",
  ];
  return stops.some((s) => pad.includes(s));
}

/**
 * Igual que en popup.js: comandos dichos tras «Activación por voz»
 * (el reconocimiento corre en la pestaña porque en el popup/iframe suele fallar).
 */
function classifyVoiceActivation(transcript: string): VoiceActivatedProfile | null {
  const raw = transcript.trim();
  const t = raw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const standardSubs = [
    "activar accesouni",
    "activar acceso uni",
    "activa accesouni",
    "activa acceso uni",
    "activar acceso univ",
    "accesouni activar",
    "acceso uni activar",
    "activar version",
    "activar versión",
    "activar la version",
    "activar la versión",
    "version accesouni",
    "versión accesouni",
    "actualizar accesouni",
    "actualizar acceso uni",
    "activar modo de voz",
    "activar modo devoz",
    "activar modo de vos",
    "activar modo voz",
    "modo de voz activado",
    "activa modo de voz",
    "activa modo voz",
    "activacion por voz",
    "comandos por voz",
    "activar comandos",
    "iniciar comandos de voz",
    "encender comandos de voz",
  ];
  if (standardSubs.some((s) => t.includes(s))) return "standard";

  if (/\bactivate\b/i.test(raw)) return "blind";

  const blindSubs = [
    "activate blind",
    "activar modo ciego",
    "perfil ciego",
    "perfil ciegos",
    "perfil de ciegos",
    "lector de pantalla",
    "modo invidente",
    "modo ciego",
    "para ciegos",
    "para invidentes",
    "activar perfil ciego",
    "activar ciegos",
    "activar ciego",
    "invidente",
    "cecidad",
    "ciego",
    "ceguera",
    "baja vision",
    "baja visibilidad",
    "necesito lector de pantalla",
  ];
  if (blindSubs.some((s) => t.includes(s))) return "blind";

  if (/^activar!?$/.test(t) || /^activa!?$/.test(t)) return "blind";

  return null;
}

let webVoiceRecognition: SpeechRecognition | null = null;
let webVoiceListening = false;
let webVoiceAttemptsLeft = 0;
let webVoiceLastFiredSig = "";

/** Cancela escucha «al primer gesto» si se desactiva la opción o se reaplica ajustes. */
let voiceAutoListenCleanup: (() => void) | null = null;

function setupVoiceAutoListen(settings: Settings): void {
  voiceAutoListenCleanup?.();
  voiceAutoListenCleanup = null;
  if (!settings.voice_auto_listen) return;

  const once = () => {
    cleanup();
    window.setTimeout(() => {
      if (!hotkeySettings.voice_auto_listen) return;
      if (webVoiceListening) return;
      startWebVoiceCommandsOnPage();
    }, 0);
  };

  const cleanup = () => {
    window.removeEventListener("pointerdown", once, true);
    window.removeEventListener("keydown", once, true);
    voiceAutoListenCleanup = null;
  };

  window.addEventListener("pointerdown", once, true);
  window.addEventListener("keydown", once, true);
  voiceAutoListenCleanup = cleanup;
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognition) | null {
  const w = window as Window & { webkitSpeechRecognition?: new () => SpeechRecognition };
  return window.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function stopWebVoiceCommands(): void {
  webVoiceListening = false;
  webVoiceAttemptsLeft = 0;
  try {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
  const rec = webVoiceRecognition;
  webVoiceRecognition = null;
  if (!rec) return;
  rec.onend = null;
  rec.onresult = null;
  rec.onerror = null;
  try {
    rec.stop();
  } catch {
    /* ignore */
  }
  try {
    rec.abort();
  } catch {
    /* ignore */
  }
}

function startWebVoiceCommandsOnPage(): void {
  if (webVoiceListening) {
    stopWebVoiceCommands();
    speak("Comandos de voz desactivados.");
    return;
  }

  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) {
    speak("Este navegador no admite reconocimiento de voz en esta pagina.");
    return;
  }

  const rec = new Ctor();
  webVoiceRecognition = rec;
  webVoiceAttemptsLeft = 8;
  webVoiceListening = true;
  webVoiceLastFiredSig = "";

  rec.lang = "es-PE";
  rec.interimResults = true;
  rec.continuous = true;
  rec.maxAlternatives = 3;

  const loopRestart = () => {
    if (!webVoiceListening) return;
    if (webVoiceAttemptsLeft <= 0) {
      webVoiceListening = false;
      webVoiceRecognition = null;
      speak("No se reconoció el comando. Pulse activación por voz e inténtelo de nuevo.");
      return;
    }
    webVoiceAttemptsLeft -= 1;
    speak("Repita el comando.");
    try {
      rec.start();
    } catch {
      /* puede ser InvalidStateError */
    }
  };

  rec.onresult = async (event: SpeechRecognitionEvent) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    transcript = transcript.trim();
    if (!transcript) return;

    if (classifyVoiceShutoff(transcript)) {
      const lastRes = event.results[event.results.length - 1];
      if (!lastRes.isFinal) return;
      stopWebVoiceCommands();
      speak("Listo.");
      return;
    }

    const readIntent = classifyVoiceReadingIntent(transcript);
    if (readIntent) {
      const lastRd = event.results[event.results.length - 1];
      if (!lastRd.isFinal) return;
      const rsig = `read:${readIntent}:${transcript.toLowerCase().slice(0, 120)}`;
      if (rsig === webVoiceLastFiredSig) return;
      webVoiceLastFiredSig = rsig;
      webVoiceListening = false;
      stopWebVoiceCommands();
      if (readIntent === "full") readFullPageAloud();
      else readImagesAloud();
      return;
    }

    const profile = classifyVoiceActivation(transcript);
    if (!profile) return;

    const last = event.results[event.results.length - 1];
    if (!last.isFinal) return;

    const sig = `${profile}:${transcript.toLowerCase().slice(0, 120)}`;
    if (sig === webVoiceLastFiredSig) return;
    webVoiceLastFiredSig = sig;

    webVoiceListening = false;
    stopWebVoiceCommands();

    speak(profile === "blind" ? "Aplicando perfil lector de pantalla." : "Reaplicando su configuración.");

    try {
      if (profile === "blind") await applyBlindVoiceProfileAndReapply();
      else await applyStandardVoiceActivation();
    } catch {
      speak("Hubo un error al aplicar el perfil.");
    }
  };

  rec.onerror = (ev: SpeechRecognitionErrorEvent) => {
    if (!webVoiceListening) return;
    if (ev.error === "no-speech" || ev.error === "aborted") {
      loopRestart();
      return;
    }
    if (ev.error === "not-allowed") {
      webVoiceListening = false;
      webVoiceRecognition = null;
      speak("Permita el microfono para este sitio en la barra de direcciones.");
      return;
    }
    loopRestart();
  };

  rec.onend = () => {
    if (webVoiceListening && webVoiceAttemptsLeft > 0) {
      try {
        rec.start();
      } catch {
        loopRestart();
      }
    }
  };

  const blindSr = hotkeySettings.access_profile === "blind";
  const childSr = hotkeySettings.access_profile === "child";
  speak(
    childSr
      ? "Te escuchamos. Di «leer pantalla» para oir la pagina en voz alta, o «pare» para cancelar."
      : blindSr
        ? "Escuchando. Diga: leer pantalla, describir imagenes, o pare para cerrar escucha."
        : "Escuchando. Diga leer pantalla, describir imagenes, activar AccesoUni, activar version, perfil lector, o pare para cancelar."
  );
  try {
    rec.start();
  } catch {
    loopRestart();
  }
}

/** Botón flotante tipo widget (ej. accessiBe): abre el mismo panel que el icono de la barra. */
let floatingLauncherGlobalsInstalled = false;

function fabShowsActiveBadge(settings: Settings): boolean {
  return (
    settings.access_profile !== "custom" ||
    settings.focus_mode ||
    settings.reduce_motion ||
    settings.semantic_reader ||
    settings.color_mode !== "auto" ||
    settings.contrast !== 100 ||
    settings.font_size !== 100
  );
}

function closeFloatingLauncherPanel() {
  const host = document.getElementById(FAB_HOST_ID);
  const root = host?.shadowRoot;
  if (!root) return;
  root.querySelector(".au-panel")?.classList.remove("au-panel--open");
  root.querySelector("#au-fab")?.setAttribute("aria-expanded", "false");
}

function onFloatingFabOutsidePointer(ev: PointerEvent) {
  const host = document.getElementById(FAB_HOST_ID);
  if (!host?.shadowRoot) return;
  const panel = host.shadowRoot.querySelector(".au-panel");
  if (!panel?.classList.contains("au-panel--open")) return;
  if (ev.composedPath().includes(host)) return;
  closeFloatingLauncherPanel();
}

function onFloatingFabEscape(ev: KeyboardEvent) {
  if (ev.key !== "Escape") return;
  closeFloatingLauncherPanel();
}

function installFloatingLauncherGlobalsOnce() {
  if (floatingLauncherGlobalsInstalled) return;
  floatingLauncherGlobalsInstalled = true;
  document.addEventListener("pointerdown", onFloatingFabOutsidePointer, true);
  window.addEventListener("keydown", onFloatingFabEscape, true);
}

function teardownFloatingLauncher() {
  document.getElementById(FAB_HOST_ID)?.remove();
}

function refreshFloatingLauncherBadge(host: HTMLElement, settings: Settings) {
  const root = host.shadowRoot;
  const badge = root?.querySelector(".au-badge") as HTMLElement | null;
  if (badge) badge.style.display = fabShowsActiveBadge(settings) ? "block" : "none";
}

function fabAnchor(): Element {
  return document.body ?? document.documentElement;
}

function ensureFabDocked(host: HTMLElement) {
  const p = fabAnchor();
  if (host.parentElement !== p) p.appendChild(host);
}

function mountFloatingLauncher(settings: Settings) {
  installFloatingLauncherGlobalsOnce();

  let host = document.getElementById(FAB_HOST_ID) as HTMLElement | null;
  if (!host) {
    host = document.createElement("div");
    host.id = FAB_HOST_ID;
    host.style.pointerEvents = "none";
    fabAnchor().appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        /* Evitar «all: initial» aquí (dejaba al host/display roto en varias páginas y el FAB no llegaba a pintarse). */
        :host {
          pointer-events: none;
          margin: 0;
          padding: 0;
          border: none;
          background: transparent;
          display: block;
        }
        .wrap {
          position: fixed;
          z-index: 2147483646;
          right: auto;
          left: max(18px, env(safe-area-inset-left));
          bottom: max(18px, env(safe-area-inset-bottom));
          font-family: system-ui, Segoe UI, Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          pointer-events: none;
          isolation: isolate;
        }
        .au-panel {
          display: none;
          pointer-events: auto;
          width: min(402px, calc(100vw - 28px));
          max-height: min(86vh, 720px);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.06);
          background: #ffffff;
        }
        .au-panel--open { display: block; animation: au-pop .18s cubic-bezier(0.2, 0.85, 0.35, 1); }
        @keyframes au-pop { from { opacity: 0; transform: translateY(8px); } }
        iframe {
          width: 100%;
          height: min(620px, 78vh);
          border: none;
          display: block;
        }
        .au-fab {
          pointer-events: auto;
          width: 54px;
          height: 54px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.35);
          cursor: pointer;
          background: #0d9488;
          box-shadow: 0 4px 16px rgba(13, 148, 136, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          flex-shrink: 0;
          transition: transform 0.12s ease;
        }
        .au-fab:hover { transform: scale(1.04); }
        .au-fab:active { transform: scale(0.97); }
        .au-fab:focus-visible {
          outline: 3px solid #1b3a4b;
          outline-offset: 3px;
        }
        .au-badge {
          position: absolute;
          bottom: 2px;
          left: 2px;
          width: 11px;
          height: 11px;
          background: #0f766e;
          border: 2px solid #ffffff;
          border-radius: 50%;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 4px rgba(0,0,0,0.35);
          display: none;
        }
      </style>
      <div class="wrap">
        <div class="au-panel" aria-label="Panel AccesoUni">
          <iframe id="au-popup-frame" title="AccesoUni · Ajustes de accesibilidad"></iframe>
        </div>
        <button type="button" id="au-fab" class="au-fab" aria-label="Abrir ajustes de accesibilidad AccesoUni" aria-expanded="false" aria-haspopup="dialog">
          <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="6" r="2.6" fill="#ffffff"/>
            <path fill="#ffffff" d="M12 9.5c-1.6 0-3 .7-4 1.8L6.5 13l1.4 1.1 1.2-1.5c.6-.7 1.5-1.1 2.4-1.1h.2c.9 0 1.8.4 2.4 1.1l1.2 1.5L16.5 13 16 11.3c-1-1.1-2.4-1.8-4-1.8z"/>
            <rect x="9" y="13" width="6" height="9" rx="1.2" fill="#ffffff"/>
            <path stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" d="M4.5 12h6M13.5 12h6"/>
          </svg>
          <span class="au-badge" aria-hidden="true"></span>
        </button>
      </div>
    `;

    const panel = shadow.querySelector(".au-panel") as HTMLElement;
    const fab = shadow.getElementById("au-fab") as HTMLButtonElement;
    const frame = shadow.getElementById("au-popup-frame") as HTMLIFrameElement;

    fab.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const isOpen = panel.classList.toggle("au-panel--open");
      fab.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (isOpen && !frame.getAttribute("src")) {
        frame.src = chrome.runtime.getURL("popup.html");
      }
    });
  }

  ensureFabDocked(host);
  refreshFloatingLauncherBadge(host, settings);
}

function syncFloatingLauncher(settings: Settings) {
  if (!settings.floating_launcher) {
    teardownFloatingLauncher();
    return;
  }
  mountFloatingLauncher(settings);
}

function watchUrlChanges(onChange: () => void) {
  const pushState = history.pushState;
  const replaceState = history.replaceState;

  let timer: number | undefined;
  const debounced = () => {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(onChange, 400);
  };

  history.pushState = function (...args) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ret = (pushState as any).apply(this, args);
    debounced();
    return ret;
  } as any;

  history.replaceState = function (...args) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ret = (replaceState as any).apply(this, args);
    debounced();
    return ret;
  } as any;

  window.addEventListener("popstate", debounced);
}

const SYNC_SETTING_KEYS = [
  "contrast",
  "font_size",
  "font_family",
  "line_spacing",
  "letter_spacing",
  "word_spacing",
  "color_mode",
  "focus_mode",
  "reduce_motion",
  "semantic_reader",
  "visual_alerts",
  "adaptive_auto",
  "floating_launcher",
  "voice_auto_listen",
  "access_profile",
] as const;

async function boot() {
  const settings = await loadSettings();
  hotkeySettings = settings;

  domMutationReapplyObserver = new MutationObserver(() => {
    if (mutationReapplyDebounceTimer !== undefined) window.clearTimeout(mutationReapplyDebounceTimer);
    mutationReapplyDebounceTimer = window.setTimeout(() => {
      void loadSettings().then((s) => pauseDomObserverAndApplyAccessibility(s));
    }, 950);
  });

  await pauseDomObserverAndApplyAccessibility(settings);
  setupVoiceAutoListen(settings);
  ensureSemanticShortcutListener();
  ensureSpeechEscapeToCancel();

  const stickyResetKeys = new Set([
    "font_size",
    "line_spacing",
    "letter_spacing",
    "word_spacing",
    "contrast",
    "color_mode",
    "access_profile",
    "adaptive_auto",
    "focus_mode",
    "reduce_motion",
  ]);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    if (!SYNC_SETTING_KEYS.some((k) => k in changes)) return;
    if (Object.keys(changes).some((k) => stickyResetKeys.has(k))) resetStickyAdaptive();
    void loadSettings().then(async (s) => {
      await pauseDomObserverAndApplyAccessibility(s);
      setupVoiceAutoListen(s);
    });
  });

  watchUrlChanges(() => {
    lastScannedUrl = "";
    lastPreambleAnnounceKey = "";
    lastAnnouncedLandingHref = "";
    warnedHarshMediaKeys.clear();
    resetStickyAdaptive();
    lastCommittedExtensionCss = "";
    scanAccessibilityAndReport();
  });

  setTimeout(() => scanAccessibilityAndReport(), 850);

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "ACCESSOUNI_REAPPLY") {
      void loadSettings().then(async (s) => {
        hotkeySettings = s;
        await pauseDomObserverAndApplyAccessibility(s);
        setupVoiceAutoListen(s);
        if (msg?.announceVoiceSummary === true) {
          announceVoiceAfterProfileApply(s, buildPageAnalysis());
        }
      });
      return;
    }
    if (msg?.type === "READ_SEMANTIC_OUTLINE") {
      readSemanticSummary({ moveFocus: true });
      return;
    }
    if (msg?.type === "READ_FULL_PAGE_ALOUD") {
      readFullPageAloud();
      return;
    }
    if (msg?.type === "READ_IMAGES_ALOUD") {
      readImagesAloud();
      return;
    }
    if (msg?.type === "START_VOICE_COMMANDS") {
      startWebVoiceCommandsOnPage();
      return;
    }
    if (msg?.type === "STOP_VOICE_COMMANDS") {
      stopWebVoiceCommands();
      return;
    }
    if (msg?.type === "VOICE_ACTIVATED") {
      const profile = msg?.profile === "blind" ? "blind" : "standard";
      void (profile === "blind" ? applyBlindVoiceProfileAndReapply() : applyStandardVoiceActivation());
      return;
    }
  });
}

boot();

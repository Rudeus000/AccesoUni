const DEFAULTS = {
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

/** Debe coincidir con ACCESS_PROFILE_PRESET en extension/src/content.ts */
const ACCESS_PROFILE_PRESET = {
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

function normalizeAccessProfile(raw) {
  const ok = ["custom", "seizure", "vision", "adhd", "cognitive", "child", "keyboard", "blind", "elder"];
  const v = String(raw ?? "custom");
  return ok.includes(v) ? v : "custom";
}

function mergePreset(profileId, floatingLauncher) {
  const p = ACCESS_PROFILE_PRESET[profileId];
  if (!p) return { ...DEFAULTS, floating_launcher: floatingLauncher, access_profile: "custom" };
  return {
    ...DEFAULTS,
    ...p,
    floating_launcher: floatingLauncher,
    access_profile: profileId,
  };
}

function setStatus(msg, tone = "muted") {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.className = "status status--" + tone;
}

function speak(text) {
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

async function getStoredSettings() {
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
  const merged = { ...DEFAULTS, ...sync };
  merged.access_profile = normalizeAccessProfile(merged.access_profile);
  return merged;
}

async function saveStoredSettings(values) {
  await chrome.storage.sync.set(values);
}

async function getAuthAndBackendConfig() {
  const local = await chrome.storage.local.get(["supabase_access_token"]);
  let backendBaseUrl = null;
  try {
    const res = await chrome.runtime.sendMessage({ type: "ACCESSOUNI_BACKEND_BASE" });
    if (res?.backendBaseUrl) backendBaseUrl = res.backendBaseUrl;
  } catch (_) {
    // Service worker puede no estar listo
  }
  return {
    token: local.supabase_access_token || null,
    backendBaseUrl,
  };
}

function extractHostname(urlOrHost) {
  try {
    const u = new URL(urlOrHost);
    return u.hostname;
  } catch {
    // Si llega como hostname
    return String(urlOrHost).replace(/^https?:\/\//, "").split("/")[0];
  }
}

async function getActiveTabDomain() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || "";
  return extractHostname(url);
}

async function startVoiceFlow() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const u = tab?.url || "";
    if (
      !tab?.id ||
      u.startsWith("chrome://") ||
      u.startsWith("edge://") ||
      u.startsWith("about:") ||
      u.startsWith("chrome-extension://")
    ) {
      setStatus("Abra una pestaña web (https) y vuelva a intentar.", "danger");
      speak("Abra una pagina web normal e intentelo de nuevo.");
      return;
    }
    await chrome.tabs.sendMessage(tab.id, { type: "START_VOICE_COMMANDS" });
    setStatus("Escuchando en la pestaña. Permita el micrófono si el navegador lo pide. Diga «pare» para cancelar.", "secondary");
  } catch {
    setStatus("No se pudo iniciar en esta pestaña. Recargue la página tras instalar la extensión.", "danger");
    speak("Recargue la pagina e intentelo de nuevo.");
  }
}

function setPopupMainInteractable(enabled) {
  const wrap = document.getElementById("popup-access-controls");
  if (!wrap) return;
  wrap.querySelectorAll("input, button, select, textarea").forEach((el) => {
    el.disabled = !enabled;
  });
}

async function syncSiteAccessGate() {
  const gate = document.getElementById("site-access-gate");
  const detailEl = document.getElementById("site-access-gate__detail");
  if (!gate || !detailEl) return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const u = tab?.url || "";

  if (
    u.startsWith("chrome://") ||
    u.startsWith("edge://") ||
    u.startsWith("about:") ||
    u.startsWith("chrome-extension://") ||
    u.startsWith("devtools://")
  ) {
    gate.hidden = false;
    detailEl.textContent = "Use una página web normal (no la pantalla interna del navegador).";
    setPopupMainInteractable(false);
    return;
  }

  if (!/^https?:\/\//i.test(u)) {
    gate.hidden = false;
    detailEl.textContent = "Solo páginas http o https.";
    setPopupMainInteractable(false);
    return;
  }

  let hostname = "";
  try {
    hostname = new URL(u).hostname.toLowerCase();
  } catch {
    gate.hidden = false;
    detailEl.textContent = "No se pudo leer la dirección de esta pestaña.";
    setPopupMainInteractable(false);
    return;
  }

  /** Refrescar lista de dominios en el worker (consulta API interna configurada por quien arma la extensión). */
  try {
    await chrome.runtime.sendMessage({ type: "ACCESSOUNI_REFRESH_ALLOWLIST" });
  } catch {
    /** sin contexto del extension */
  }

  const st = await chrome.runtime.sendMessage({ type: "ACCESSOUNI_SITE_ACCESS", hostname });

  if (!st?.hasBackendUrl) {
    gate.hidden = false;
    detailEl.textContent = "Versión mal empaquetada: falta dirección interna del API.";
    setPopupMainInteractable(false);
    return;
  }

  if (st.domainsCount === 0) {
    gate.hidden = false;
    detailEl.textContent = st.lastFetchOk
      ? "Ningún dominio activo en el servidor."
      : "No hay conexión con el servidor o no responde.";
    setPopupMainInteractable(false);
    return;
  }

  if (!st.allowed) {
    gate.hidden = false;
    detailEl.textContent = `Dominio no autorizado: ${hostname}`;
    setPopupMainInteractable(false);
    return;
  }

  gate.hidden = true;
  detailEl.textContent = "";
  setPopupMainInteractable(true);
}

async function wireUpUI() {
  const settings = await getStoredSettings();

  const elContrast = document.getElementById("contrast");
  const elFontSize = document.getElementById("font_size");
  const elFontFamily = document.getElementById("font_family");
  const elLineSpacing = document.getElementById("line_spacing");
  const elLetterSpacing = document.getElementById("letter_spacing");
  const elWordSpacing = document.getElementById("word_spacing");
  const elColorMode = document.getElementById("color_mode");
  const elFocusMode = document.getElementById("focus_mode");
  const elReduceMotion = document.getElementById("reduce_motion");
  const elSemanticReader = document.getElementById("semantic_reader");
  const elVisualAlerts = document.getElementById("visual_alerts");
  const elAdaptiveAuto = document.getElementById("adaptive_auto");
  const elFloatingLauncher = document.getElementById("floating_launcher");
  const elVoiceAutoListen = document.getElementById("voice_auto_listen");

  function syncFormFromSettings(s) {
    elContrast.value = s.contrast;
    elFontSize.value = s.font_size;
    elFontFamily.value = s.font_family;
    elLineSpacing.value = s.line_spacing;
    elLetterSpacing.value = s.letter_spacing;
    elWordSpacing.value = s.word_spacing;
    elColorMode.value = s.color_mode;
    elFocusMode.checked = Boolean(s.focus_mode);
    elReduceMotion.checked = Boolean(s.reduce_motion);
    elSemanticReader.checked = Boolean(s.semantic_reader);
    elVisualAlerts.checked = Boolean(s.visual_alerts);
    elAdaptiveAuto.checked = Boolean(s.adaptive_auto);
    elFloatingLauncher.checked = Boolean(s.floating_launcher);
    elVoiceAutoListen.checked = Boolean(s.voice_auto_listen);
    const pid = normalizeAccessProfile(s.access_profile);
    const r = document.querySelector(`input[name="access_profile"][value="${pid}"]`);
    if (r) r.checked = true;
  }

  syncFormFromSettings(settings);

  await syncSiteAccessGate();

  function readValuesFromForm() {
    const access_profile = normalizeAccessProfile(
      document.querySelector('input[name="access_profile"]:checked')?.value
    );
    return {
      contrast: Number(elContrast.value),
      font_size: Number(elFontSize.value),
      font_family: elFontFamily.value,
      line_spacing: Number(elLineSpacing.value),
      letter_spacing: Number(elLetterSpacing.value),
      word_spacing: Number(elWordSpacing.value),
      color_mode: elColorMode.value,
      focus_mode: elFocusMode.checked,
      reduce_motion: elReduceMotion.checked,
      semantic_reader: elSemanticReader.checked,
      visual_alerts: elVisualAlerts.checked,
      adaptive_auto: elAdaptiveAuto.checked,
      floating_launcher: elFloatingLauncher.checked,
      voice_auto_listen: elVoiceAutoListen.checked,
      access_profile,
    };
  }

  let applyDebounceTimer;

  async function persistAndReapplyToActiveTab(values, opts = {}) {
    await saveStoredSettings(values);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const u = tab?.url || "";
      if (tab?.id && !u.startsWith("chrome://") && !u.startsWith("edge://")) {
        await chrome.tabs.sendMessage(tab.id, {
          type: "ACCESSOUNI_REAPPLY",
          announceVoiceSummary: Boolean(opts.announceVoiceSummary),
        });
      }
    } catch {
      /* PDF, chrome settings, etc. */
    }
  }

  /** Ajustes manuales: fuerza modo personalizado. */
  function scheduleApplyManual() {
    clearTimeout(applyDebounceTimer);
    applyDebounceTimer = setTimeout(() => {
      const c = document.getElementById("profile_radio_custom");
      if (c) c.checked = true;
      void persistAndReapplyToActiveTab(readValuesFromForm());
    }, 220);
  }

  document.querySelectorAll('input[name="access_profile"]').forEach((inp) => {
    inp.addEventListener("change", async () => {
      if (!inp.checked) return;
      const pid = inp.value;
      const flo = elFloatingLauncher.checked;
      if (pid === "custom") {
        await persistAndReapplyToActiveTab(readValuesFromForm(), { announceVoiceSummary: true });
      } else {
        const merged = mergePreset(pid, flo);
        syncFormFromSettings(merged);
        await persistAndReapplyToActiveTab(merged, { announceVoiceSummary: true });
      }
    });
  });

  [
    elContrast,
    elFontSize,
    elFontFamily,
    elLineSpacing,
    elLetterSpacing,
    elWordSpacing,
    elColorMode,
    elFocusMode,
    elReduceMotion,
    elSemanticReader,
    elVisualAlerts,
    elAdaptiveAuto,
    elFloatingLauncher,
    elVoiceAutoListen,
  ].forEach((el) => {
    el.addEventListener("change", scheduleApplyManual);
    if (el.type === "number") el.addEventListener("input", scheduleApplyManual);
  });

  elFloatingLauncher.addEventListener("change", () => void persistAndReapplyToActiveTab(readValuesFromForm()));

  document.getElementById("saveBtn").addEventListener("click", async () => {
    const values = readValuesFromForm();
    await persistAndReapplyToActiveTab(values, {
      announceVoiceSummary:
        values.access_profile === "blind" ||
        values.access_profile === "child" ||
        Boolean(values.semantic_reader),
    });

    const { token, backendBaseUrl } = await getAuthAndBackendConfig();
    if (!backendBaseUrl) {
      setStatus("No se pudo contactar el API configurado para esta extensión.", "danger");
      return;
    }
    if (!token) {
      setStatus("Sesión incompleta. Inicie sesión para sincronizar (supabase_access_token).", "danger");
      speak("Inicie sesión para poder sincronizar con el servidor.");
      return;
    }

    const domain = await getActiveTabDomain();
    const payload = {
      domain,
      ...values,
    };

    setStatus("Sincronizando con el servidor...");
    try {
      await fetch(`${backendBaseUrl}/api/v1/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      setStatus("Cambios guardados en el servidor.", "secondary");
      speak("Cambios guardados en el servidor.");
    } catch (e) {
      setStatus("Error de red al guardar. Compruebe la conexión e inténtelo de nuevo.", "danger");
    }
  });

  document.getElementById("voiceBtn").addEventListener("click", () => {
    startVoiceFlow();
  });

  document.getElementById("semanticBtn").addEventListener("click", async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await chrome.tabs.sendMessage(tab.id, { type: "READ_SEMANTIC_OUTLINE" });
        setStatus("Generando informe de estructura.", "secondary");
      }
    } catch {
      setStatus("No disponible en esta pestaña. Abra una página web estándar (http o https).", "danger");
    }
  });

  document.getElementById("readPageBtn").addEventListener("click", async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const u = tab?.url || "";
      if (
        !tab?.id ||
        u.startsWith("chrome://") ||
        u.startsWith("edge://") ||
        u.startsWith("chrome-extension://")
      ) {
        setStatus("Abra una página web normal en esta pestaña.", "danger");
        return;
      }
      await chrome.tabs.sendMessage(tab.id, { type: "READ_FULL_PAGE_ALOUD" });
      setStatus("Leyendo texto visible en fragmentos. Pulse Escape para cancelar.", "secondary");
    } catch {
      setStatus("Recargue la página e intente de nuevo.", "danger");
    }
  });

  document.getElementById("readImagesBtn").addEventListener("click", async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const u = tab?.url || "";
      if (
        !tab?.id ||
        u.startsWith("chrome://") ||
        u.startsWith("edge://") ||
        u.startsWith("chrome-extension://")
      ) {
        setStatus("Abra una página web normal en esta pestaña.", "danger");
        return;
      }
      await chrome.tabs.sendMessage(tab.id, { type: "READ_IMAGES_ALOUD" });
      setStatus("Describiendo imágenes con alt y metadatos. Escape para cancelar.", "secondary");
    } catch {
      setStatus("Recargue la página e intente de nuevo.", "danger");
    }
  });

  const tokenInput = document.getElementById("supabase_token_input");
  const saveTokenBtn = document.getElementById("saveTokenBtn");
  const openServerLoginBtn = document.getElementById("openServerLoginBtn");
  const tokenStatus = document.getElementById("tokenStatus");

  async function refreshTokenStatus() {
    const { token } = await getAuthAndBackendConfig();
    if (tokenStatus) {
      tokenStatus.textContent = token
        ? "Sesión guardada en la extensión."
        : "Sin token: use el botón de arriba o pegue el JWT manualmente.";
    }
  }

  await refreshTokenStatus();

  openServerLoginBtn?.addEventListener("click", async () => {
    const { backendBaseUrl } = await getAuthAndBackendConfig();
    if (!backendBaseUrl) {
      setStatus("No hay dirección del API en esta extensión.", "danger");
      return;
    }
    window.open(`${backendBaseUrl}/extension-login`, "_blank", "noopener");
  });

  saveTokenBtn?.addEventListener("click", async () => {
    const raw = (tokenInput?.value || "").trim();
    if (!raw) {
      setStatus("Pegue el token en el campo o inicie sesión en el servidor.", "danger");
      return;
    }
    await chrome.storage.local.set({ supabase_access_token: raw });
    if (tokenInput) tokenInput.value = "";
    setStatus("Sesión guardada en la extensión.", "secondary");
    speak("Sesion guardada.");
    await refreshTokenStatus();
  });
}

wireUpUI();


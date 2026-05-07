/**
 * Inyecta CSS a nivel de extensión (no lo bloquea el CSP de la página como un <style> en el DOM).
 * Map: tabId -> última hoja insertada (para removeCSS antes de volver a insertar).
 */
const tabLastCss = new Map();

const CONTENT_SCRIPT_ID = "accessouni-main-content";

/** Dominios apex institucionales (activos), alineados con `GET /api/v1/public/allowed-domains`. */
let cachedAllowedDomains = [];
let lastFetchOk = false;
/** Url base resuelta desde constante interna `ACCOUNI_BACKEND_API_BASE_URL`. */
let lastKnownBackendUrl = "";

const ALLOWLIST_REFRESH_ALARM = "accessouni-refresh-allowed-domains";

/**
 * URL base interna del API AccesoUni (FastAPI).
 * Producción / empaque: cambie aquí antes de generar la extensión; el usuario final no la edita.
 */
const ACCOUNI_BACKEND_API_BASE_URL = "http://127.0.0.1:8000";

function getConfiguredBackendUrl() {
  return String(ACCOUNI_BACKEND_API_BASE_URL || "")
    .trim()
    .replace(/\/$/, "");
}

function scheduleAllowlistPollingAlarm() {
  /* Mismo nombre sustituye la alarma anterior si ya existía */
  chrome.alarms.create(ALLOWLIST_REFRESH_ALARM, { periodInMinutes: 90 });
}

chrome.tabs.onRemoved.addListener((tabId) => {
  tabLastCss.delete(tabId);
});

function normalizeApex(d) {
  return String(d ?? "")
    .trim()
    .toLowerCase()
    .replace(/^\./, "");
}

function hostUnderApex(hostname, apex) {
  const h = String(hostname ?? "")
    .trim()
    .toLowerCase();
  const a = normalizeApex(apex);
  if (!h || !a) return false;
  return h === a || h.endsWith("." + a);
}

function isHostnameAllowed(hostname, domains) {
  const h = String(hostname ?? "")
    .trim()
    .toLowerCase();
  if (!h || !domains?.length) return false;
  for (const apex of domains) {
    if (hostUnderApex(h, apex)) return true;
  }
  return false;
}

function buildMatchPatterns(domains) {
  const out = new Set();
  for (const raw of domains) {
    const d = normalizeApex(raw);
    if (!d || d.includes("/") || d.includes("*")) continue;
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(d)) {
      out.add(`http://${d}/*`);
      out.add(`https://${d}/*`);
      continue;
    }
    out.add(`*://${d}/*`);
    out.add(`*://*.${d}/*`);
  }
  return [...out];
}

async function unregisterContentScript() {
  try {
    await chrome.scripting.unregisterContentScripts({ ids: [CONTENT_SCRIPT_ID] });
  } catch {
    // id inexistente o permisos aún vacíos
  }
}

async function refreshAllowlistAndRegisterScripts() {
  const LOCAL = chrome.storage.local;
  const stored = await LOCAL.get(["cached_allowed_domains", "cached_allowed_domains_updated_at"]);

  const backend = getConfiguredBackendUrl();
  lastKnownBackendUrl = backend;

  if (!backend) {
    lastFetchOk = false;
    cachedAllowedDomains = [];
    await unregisterContentScript();
    return;
  }

  let domains = Array.isArray(stored.cached_allowed_domains)
    ? stored.cached_allowed_domains.map((d) => normalizeApex(d)).filter(Boolean)
    : [];

  const staleMs = 7 * 86400000;
  const updatedAtBefore = Number(stored.cached_allowed_domains_updated_at) || 0;

  lastFetchOk = false;
  try {
    const res = await fetch(`${backend}/api/v1/public/allowed-domains`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.domains)) {
        domains = data.domains.map((d) => normalizeApex(d)).filter(Boolean);
        await LOCAL.set({
          cached_allowed_domains: domains,
          cached_allowed_domains_updated_at: Date.now(),
        });
        lastFetchOk = true;
      }
    }
  } catch {
    // red caída: intentar política cacheada si no es muy antigua
  }

  if (!lastFetchOk) {
    const cacheStale = !updatedAtBefore || Date.now() - updatedAtBefore > staleMs;
    if (!domains.length || cacheStale) {
      cachedAllowedDomains = [];
      await unregisterContentScript();
      return;
    }
  }

  cachedAllowedDomains = domains;

  const patterns = buildMatchPatterns(domains);
  if (!patterns.length) {
    await unregisterContentScript();
    return;
  }

  try {
    await unregisterContentScript();
    await chrome.scripting.registerContentScripts([
      {
        id: CONTENT_SCRIPT_ID,
        matches: patterns,
        js: ["dist/contentScript.js"],
        runAt: "document_idle",
      },
    ]);
  } catch (e) {
    console.warn("AccesoUni: registerContentScripts", e);
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "ACCESSOUNI_BACKEND_BASE") {
    const u = getConfiguredBackendUrl();
    sendResponse({ backendBaseUrl: u || null });
    return false;
  }

  if (msg?.type === "ACCESSOUNI_REFRESH_ALLOWLIST") {
    void refreshAllowlistAndRegisterScripts().then(() => sendResponse({ ok: true }));
    return true;
  }

  if (msg?.type === "ACCESSOUNI_SITE_ACCESS") {
    const hostname = String(msg.hostname || "")
      .trim()
      .toLowerCase();
    sendResponse({
      allowed: isHostnameAllowed(hostname, cachedAllowedDomains),
      domainsCount: cachedAllowedDomains.length,
      lastFetchOk,
      hasBackendUrl: Boolean(lastKnownBackendUrl),
    });
    return false;
  }

  if (msg?.type !== "ACCESSOUNI_INSERT_CSS") return false;
  const tabId = sender.tab?.id;
  if (!tabId) {
    sendResponse({ ok: false, error: "no_tab" });
    return false;
  }

  const nextCss = typeof msg.css === "string" ? msg.css : "";
  const prevCss = tabLastCss.get(tabId);

  (async () => {
    try {
      if (prevCss) {
        try {
          await chrome.scripting.removeCSS({ target: { tabId }, css: prevCss });
        } catch {
          // ignorar si ya no aplica
        }
      }
      if (nextCss.length > 0) {
        await chrome.scripting.insertCSS({ target: { tabId }, css: nextCss });
        tabLastCss.set(tabId, nextCss);
      } else {
        tabLastCss.delete(tabId);
      }
      sendResponse({ ok: true });
    } catch (e) {
      sendResponse({ ok: false, error: String(e) });
    }
  })();

  return true;
});

chrome.runtime.onInstalled.addListener(async (details) => {
  scheduleAllowlistPollingAlarm();
  await refreshAllowlistAndRegisterScripts();
  if (details.reason === "install") {
    const cur = await chrome.storage.sync.get("semantic_reader");
    if (typeof cur.semantic_reader === "undefined") {
      await chrome.storage.sync.set({ semantic_reader: true });
    }
  }
});

chrome.runtime.onStartup.addListener(() => {
  scheduleAllowlistPollingAlarm();
  void refreshAllowlistAndRegisterScripts();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== ALLOWLIST_REFRESH_ALARM) return;
  void refreshAllowlistAndRegisterScripts();
});

scheduleAllowlistPollingAlarm();
void refreshAllowlistAndRegisterScripts();

/**
 * Sin abrir el panel: mismo efecto que el boton «Activación por voz».
 * Chrome permite reasignar en chrome://extensions/shortcuts → AccesoUni.
 */
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "ACCESSOUNI_VOICE_COMMANDS") return;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const u = tab?.url || "";
    if (
      !tab?.id ||
      u.startsWith("chrome://") ||
      u.startsWith("edge://") ||
      u.startsWith("about:") ||
      u.startsWith("chrome-extension://") ||
      u.startsWith("devtools://")
    ) {
      return;
    }
    let host = "";
    try {
      host = new URL(u).hostname;
    } catch {
      return;
    }
    if (!isHostnameAllowed(host, cachedAllowedDomains)) return;
    await chrome.tabs.sendMessage(tab.id, { type: "START_VOICE_COMMANDS" });
  } catch {
    /** El content script puede no estar listo hasta recargar la pestaña. */
  }
});

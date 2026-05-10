/**
 * Marca runtime embebido y lee `data-*` del `<script>` que carga el widget.
 * Con `defer`, `document.currentScript` suele ser null; se busca el último `script[src]` que termina en `widget.js`.
 */
type EmbedOpts = {
  popupUrl: string;
  apiBase: string;
  siteKey: string;
  defaultProfile: string;
};

(function initAccesoUniEmbed(): void {
  const g = globalThis as typeof globalThis & {
    __ACCESSOUNI_EMBED__?: boolean;
    __ACCESSOUNI_EMBED_OPTS__?: EmbedOpts;
  };
  g.__ACCESSOUNI_EMBED__ = true;

  let el = document.currentScript as HTMLScriptElement | null;
  if (!el?.src) {
    const list = [...document.querySelectorAll("script[src]")] as HTMLScriptElement[];
    for (let i = list.length - 1; i >= 0; i--) {
      const src = list[i].src || "";
      if (/widget\.js(\?|#|$)/i.test(src) || /\/widget\.js/i.test(src)) {
        el = list[i];
        break;
      }
    }
  }

  g.__ACCESSOUNI_EMBED_OPTS__ = {
    popupUrl: el?.getAttribute("data-popup-url") ?? "",
    apiBase: el?.getAttribute("data-api-base") ?? "",
    siteKey: el?.getAttribute("data-site-key") ?? "",
    defaultProfile: el?.getAttribute("data-profile") ?? "",
  };
})();

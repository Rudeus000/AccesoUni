import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extRoot = path.join(__dirname, "..");
const src = path.join(extRoot, "dist", "widget.js");
const destDir = path.join(extRoot, "..", "web-demo", "public");
const dest = path.join(destDir, "widget.js");

if (!fs.existsSync(src)) {
  console.warn("[copy-widget-demo] No existe dist/widget.js — ejecute npm run build primero.");
  process.exit(0);
}
fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log("[copy-widget-demo] Copiado a web-demo/public/widget.js");

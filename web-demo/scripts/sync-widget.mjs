import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const demoRoot = path.join(__dirname, "..");
const src = path.join(demoRoot, "..", "extension", "dist", "widget.js");
const destDir = path.join(demoRoot, "public");
const dest = path.join(destDir, "widget.js");

if (!fs.existsSync(src)) {
  console.warn("[sync-widget] No existe extension/dist/widget.js — ejecute: cd extension && npm run build");
  process.exit(0);
}
fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log("[sync-widget] widget.js → public/widget.js");

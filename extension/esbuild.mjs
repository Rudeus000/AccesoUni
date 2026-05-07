import esbuild from "esbuild";

const isProd = process.env.NODE_ENV === "production";

await esbuild.build({
  entryPoints: ["src/content.ts"],
  bundle: true,
  minify: isProd,
  sourcemap: !isProd,
  format: "iife",
  platform: "browser",
  target: "es2019",
  outfile: "dist/contentScript.js",
  logLevel: "info",
});


import esbuild from "esbuild";

const isProd = process.env.NODE_ENV === "production";

const shared = {
  bundle: true,
  minify: isProd,
  sourcemap: !isProd,
  format: "iife",
  platform: "browser",
  target: "es2019",
  logLevel: "info",
};

await esbuild.build({
  ...shared,
  entryPoints: ["src/content.ts"],
  outfile: "dist/contentScript.js",
});

await esbuild.build({
  ...shared,
  entryPoints: ["src/widget.ts"],
  outfile: "dist/widget.js",
});

import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { DemoBanner } from "@/components/DemoBanner";

export const metadata: Metadata = {
  title: "Portal de demostración — AccesoUni",
  description: "Página de prueba con widget embebido para validar inyección y perfiles visuales.",
};

export default function PortalPruebaPage() {
  return (
    <>
      <Script
        id="accesouni-widget"
        src="/widget.js"
        strategy="afterInteractive"
        data-profile="vision"
        data-popup-url=""
      />

      <div id="contenido">
        <DemoBanner />

        <div className="mx-auto grid max-w-[960px] gap-6 px-5 py-6 pb-12 md:grid-cols-[220px_1fr]">
          <aside className="rounded-xl bg-slate-200 p-4 text-sm text-slate-600" aria-label="Menú institucional simulado">
            <h2 className="mb-2 text-base font-semibold text-slate-700">Accesos</h2>
            <p>Matrícula · Biblioteca · Aula virtual · Trámites</p>
          </aside>

          <main
            id="main"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sheet"
            aria-label="Contenido simulado de intranet"
          >
            <h1 className="mb-3 text-lg font-semibold text-slate-500">Aviso académico — ciclo 2026-I</h1>
            <p className="text-[12px] leading-snug text-slate-400">
              Este párrafo simula contenido institucional con tipografía reducida y color gris claro sobre blanco. Sin
              ayudas, puede incumplir umbrales de contraste WCAG 2.1 AA para texto normal. Active AccesoUni (perfil baja
              visión o contraste alto) para comprobar la mejora perceptible.
            </p>
            <p className="mt-4 text-sm text-slate-500">
              Contenido de relleno: calificaciones, horarios y material del curso cuando el portal cumpla accesibilidad en
              plantilla y CMS.
            </p>
            <nav className="mt-6" aria-label="Enlaces de prueba">
              <ul className="list-inside list-disc space-y-1 text-teal-dark">
                <li>
                  <a href="#" className="underline hover:text-teal">
                    Enlace de ejemplo al expediente
                  </a>
                </li>
                <li>
                  <a href="#" className="underline hover:text-teal">
                    Descarga de sílabo (PDF)
                  </a>
                </li>
              </ul>
            </nav>
          </main>
        </div>

        <div className="mx-auto max-w-[960px] px-5 pb-10">
          <Link href="/" className="text-sm font-medium text-teal-dark underline hover:text-teal">
            ← Volver al sitio AccesoUni
          </Link>
        </div>
      </div>
    </>
  );
}

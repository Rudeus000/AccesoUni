import * as Separator from "@radix-ui/react-separator";
import Link from "next/link";
import { FadeIn } from "@/components/FadeIn";
import { HeroMotion } from "@/components/HeroMotion";

const ruFeatures = [
  { tag: "RU01 · Alta", title: "Activación por voz", body: "Comando despertador y Web Speech API para activar AccesoUni sin depender de la vista (hands-free)." },
  { tag: "RU02 · Alta", title: "Lector semántico", body: "Mapa auditivo según jerarquía HTML5: regiones, encabezados y contenido principal." },
  { tag: "RU03 · Alta", title: "Subtitulado dinámico", body: "Transcripción en tiempo real cuando el multimedia carece de subtítulos nativos (según navegador y CORS)." },
  { tag: "RU04 · Media", title: "Alertas visuales", body: "Refuerzo visual perimetral para usuarios sordos ante eventos antes solo sonoros." },
  { tag: "RU05 · Alta", title: "Capas visuales", body: "Contraste, texto hasta 200%, interlineado, espaciado y modo de color vía CSS inyectado." },
  { tag: "RU06 · Media", title: "Perfil en la nube", body: "Sincronización con FastAPI y Supabase Auth cuando el usuario tiene sesión." },
];

const carBlocks = [
  { tag: "CAR01–CAR04", title: "Experiencia inclusiva", body: "Voz, lector semántico, subtítulos asistidos y ajuste visual con vista previa en sitio." },
  { tag: "CAR05–CAR06", title: "Datos y auditoría", body: "Perfil sincronizado y escaneo heurístico por página con métricas al API." },
  { tag: "CAR07–CAR08", title: "Valor institucional", body: "Panel SaaS y certificados PDF para procesos ante SUNEDU (según despliegue)." },
  { tag: "CAR09–CAR10", title: "Seguridad multi-tenant", body: "RLS en Supabase, retención y aislamiento por institución en el modelo ERS." },
];

const stack = [
  { tag: "Cliente", title: "Manifest V3", body: "Service worker, content script y popup; sin código remoto arbitrario en la extensión publicada." },
  { tag: "Embed", title: "widget.js", body: "Misma lógica para WordPress/Wix: build en extension/ y copia a public/widget.js." },
  { tag: "Servidor", title: "FastAPI + Supabase", body: "Dominios permitidos, preferencias y logs de cumplimiento con PostgreSQL y RLS." },
];

export default function HomePage() {
  return (
    <>
      <HeroMotion />

      <main id="contenido">
        <FadeIn>
          <section className="mx-auto max-w-[1100px] px-5 pb-12">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sheet">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Marco normativo y técnico</h2>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-navy">
                {["WCAG 2.1 nivel AA", "SUNEDU / MINEDU", "Ley N.º 29733 (Perú)", "IEEE 830 — ERS"].map((x) => (
                  <li key={x} className="flex items-center gap-2">
                    <span className="text-teal" aria-hidden>
                      ✓
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </FadeIn>

        <div className="mx-auto max-w-[1100px] px-5">
          <Separator.Root className="h-px w-full bg-slate-200" decorative />
        </div>

        <FadeIn className="mx-auto max-w-[1100px] px-5 py-14" delay={0.05}>
          <section id="funcionalidades">
            <h2 className="mb-2 text-2xl font-bold text-navy">Requerimientos funcionales (usuario)</h2>
            <p className="mb-8 max-w-[70ch] text-slate-600">
              Núcleo del ERS v2: valor para el estudiante y la gestión institucional.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ruFeatures.map((f, i) => (
                <article
                  key={f.tag}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sheet transition hover:border-teal/30 hover:shadow-md"
                >
                  <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-teal-dark">{f.tag}</p>
                  <h3 className="mb-2 text-base font-semibold text-navy">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{f.body}</p>
                </article>
              ))}
            </div>
          </section>
        </FadeIn>

        <FadeIn className="mx-auto max-w-[1100px] px-5 py-14" delay={0.08}>
          <section id="caracteristicas">
            <h2 className="mb-8 text-2xl font-bold text-navy">Características del sistema (CAR)</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {carBlocks.map((c) => (
                <article key={c.tag} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sheet">
                  <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-teal-dark">{c.tag}</p>
                  <h3 className="mb-2 text-base font-semibold text-navy">{c.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{c.body}</p>
                </article>
              ))}
            </div>
          </section>
        </FadeIn>

        <FadeIn className="mx-auto max-w-[1100px] px-5 py-14" delay={0.1}>
          <section id="arquitectura">
            <h2 className="mb-8 text-2xl font-bold text-navy">Arquitectura técnica (RS)</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {stack.map((s) => (
                <article key={s.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sheet">
                  <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-teal-dark">{s.tag}</p>
                  <h3 className="mb-2 text-base font-semibold text-navy">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{s.body}</p>
                </article>
              ))}
            </div>
          </section>
        </FadeIn>

        <section className="mt-4 bg-gradient-to-br from-navy via-navy to-teal-dark py-16 text-white">
          <div className="mx-auto max-w-[1100px] px-5 text-center">
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">Comprobar la inyección en vivo</h2>
            <p className="mx-auto mb-8 max-w-[52ch] text-lg text-white/90">
              El portal de prueba simula una intranet con baja legibilidad. Con el widget cargado verá el botón flotante y
              los ajustes alineados a WCAG.
            </p>
            <Link
              href="/portal-prueba"
              className="inline-flex rounded-full bg-teal px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-teal-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            >
              Abrir portal de prueba
            </Link>
          </div>
        </section>

        <footer className="border-t border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-600">
          <p className="font-semibold text-navy">AccesoUni — ERS v2.0</p>
          <p className="mt-1">Stack: Python (FastAPI), Supabase (PostgreSQL), Chrome Manifest V3, Next.js (demo).</p>
        </footer>
      </main>
    </>
  );
}

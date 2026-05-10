"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function HeroMotion() {
  const reduce = useReducedMotion();

  return (
    <section className="mx-auto max-w-[1100px] px-5 pb-10 pt-12 md:pt-16">
      <motion.span
        className="mb-4 inline-block rounded-full bg-teal-soft px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-teal-dark"
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={reduce ? undefined : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        ERS v2.0 · Especificación de requerimientos
      </motion.span>

      <motion.h1
        className="mb-4 max-w-[18ch] text-4xl font-bold leading-tight tracking-tight text-navy-deep md:text-5xl"
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
      >
        Accesibilidad universal en portales universitarios
      </motion.h1>

      <motion.p
        className="mb-8 max-w-[62ch] text-lg text-slate-600"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
      >
        AccesoUni es una solución SaaS para estudiantes con discapacidad visual, auditiva o cognitiva: activación por
        voz, lector semántico, ajustes visuales y métricas para la institución. Compatible con{" "}
        <strong className="font-semibold text-navy">Manifest V3</strong> e{" "}
        <strong className="font-semibold text-navy">inyección por script</strong> (WordPress / Wix).
      </motion.p>

      <motion.div
        className="flex flex-wrap gap-3"
        initial={reduce ? false : { opacity: 0 }}
        animate={reduce ? undefined : { opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Link
          href="/portal-prueba"
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-white shadow-sm",
            "transition hover:bg-teal-dark hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          )}
        >
          Ver demo con widget
        </Link>
        <a
          href="https://github.com/Rudeus000/AccesoUni/blob/main/docs/wcag-21-aa-guia-accesouni.md"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center justify-center rounded-full border-2 border-navy px-5 py-2.5 text-sm font-semibold text-navy",
            "hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          )}
        >
          Guía WCAG (GitHub)
        </a>
      </motion.div>
    </section>
  );
}

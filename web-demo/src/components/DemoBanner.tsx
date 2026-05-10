"use client";

import { motion, useReducedMotion } from "framer-motion";

export function DemoBanner() {
  const reduce = useReducedMotion();

  return (
    <div className="px-5 pt-6">
      <motion.div
        role="status"
        className="mx-auto max-w-[960px] rounded-xl border border-amber-400/80 bg-amber-50 px-5 py-4 text-sm text-amber-950 shadow-sm"
        initial={reduce ? false : { opacity: 0, y: -8 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <strong>Demostración técnica.</strong> Bloque con baja legibilidad a propósito. Ejecute{" "}
        <code className="rounded bg-black/5 px-1.5 py-0.5 text-[13px]">cd extension && npm run build</code> y luego en{" "}
        <code className="rounded bg-black/5 px-1.5 py-0.5 text-[13px]">web-demo</code>:{" "}
        <code className="rounded bg-black/5 px-1.5 py-0.5 text-[13px]">npm run dev</code> (sincroniza{" "}
        <code className="rounded bg-black/5 px-1.5 py-0.5 text-[13px]">public/widget.js</code>). Debe aparecer el botón
        flotante turquesa; mantenga pulsado para voz.
      </motion.div>
    </div>
  );
}

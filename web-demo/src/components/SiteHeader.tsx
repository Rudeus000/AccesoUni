"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const items = [
  { href: "/#funcionalidades", label: "Funcionalidades" },
  { href: "/#caracteristicas", label: "CAR" },
  { href: "/#arquitectura", label: "Stack" },
];

export function SiteHeader() {
  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-br from-navy to-navy-deep shadow-md"
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5 text-white no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400">
          <span className="flex items-end gap-1" aria-hidden>
            <span className="h-[22px] w-[5px] rounded-sm bg-teal" />
            <span className="h-[14px] w-[5px] rounded-sm bg-teal opacity-90" />
          </span>
          <span className="text-lg font-bold tracking-wide">AccesoUni</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          <NavigationMenu.Root>
            <NavigationMenu.List className="flex items-center gap-1">
              {items.map((it) => (
                <NavigationMenu.Item key={it.href}>
                  <NavigationMenu.Link
                    className={cn(
                      "inline-flex rounded-full px-3 py-2 text-sm font-medium text-white/90 outline-none",
                      "hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-amber-400"
                    )}
                    href={it.href}
                  >
                    {it.label}
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
              ))}
            </NavigationMenu.List>
          </NavigationMenu.Root>
          <Link
            href="/portal-prueba"
            className="ml-2 inline-flex rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          >
            Probar inyección
          </Link>
        </nav>

        <div className="flex md:hidden">
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                aria-label="Abrir menú"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Menú
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-[2px]" />
              <Dialog.Content className="fixed right-0 top-0 z-[101] flex h-full w-[min(100%,320px)] flex-col border-l border-slate-200 bg-white p-6 shadow-2xl outline-none">
                <Dialog.Title className="text-lg font-bold text-navy">Navegación</Dialog.Title>
                <Dialog.Description className="sr-only">Enlaces principales del sitio demo AccesoUni</Dialog.Description>
                <ul className="mt-6 flex flex-col gap-2">
                  {items.map((it) => (
                    <li key={it.href}>
                      <Dialog.Close asChild>
                        <Link
                          href={it.href}
                          className="block rounded-lg px-3 py-3 text-base font-medium text-slate-700 hover:bg-teal-soft hover:text-teal-dark"
                        >
                          {it.label}
                        </Link>
                      </Dialog.Close>
                    </li>
                  ))}
                  <li>
                    <Dialog.Close asChild>
                      <Link
                        href="/portal-prueba"
                        className="mt-4 block rounded-full bg-teal px-4 py-3 text-center font-semibold text-white hover:bg-teal-dark"
                      >
                        Probar inyección
                      </Link>
                    </Dialog.Close>
                  </li>
                </ul>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="absolute right-4 top-4 rounded-full p-2 text-slate-500 hover:bg-slate-100"
                    aria-label="Cerrar"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </motion.header>
  );
}

"use client";

import Link from "next/link";
import { useI18n } from "@/components/providers/i18n-provider";

const columns = {
  "pt-BR": [
    {
      items: [
        { name: "Viagem", desc: "Descoberta e decisão em tempo real", href: "/sponsors" },
        { name: "Shopping", desc: "Recomendação de produtos com intenção clara", href: "/sponsors" },
      ],
    },
    {
      items: [{ name: "Coding tools", desc: "Indicação de ferramentas e aquisição de builders", href: "/devs" }],
    },
  ],
  en: [
    {
      items: [
        { name: "Travel", desc: "Discovery and decision-making in real time", href: "/sponsors" },
        { name: "Shopping", desc: "Product recommendations with clear intent", href: "/sponsors" },
      ],
    },
    {
      items: [{ name: "Coding tools", desc: "Tool recommendations and builder acquisition", href: "/devs" }],
    },
  ],
} as const;

export function UseCasesMegaMenu() {
  const { locale } = useI18n();
  const isPt = locale === "pt-BR";
  const content = columns[locale];

  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[360px_1fr] md:p-8">
      <div className="relative flex flex-col justify-between rounded-2xl border border-violet/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,238,255,0.96))] p-7 text-foreground shadow-[0_20px_60px_rgba(88,28,135,0.08)] dark:border-violet/20 dark:bg-[linear-gradient(180deg,rgba(124,58,237,0.34),rgba(17,17,20,0.92))] dark:text-white dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div>
          <div className="mb-5 text-4xl font-black leading-none text-violet/70 dark:text-white/90">”</div>
          <p className="text-[17px] leading-snug">
            {isPt ? (
              <>
                A Bido pode virar uma{" "}
                <span className="font-bold">camada central de monetização e distribuição</span>{" "}
                para produtos guiados por IA, conectando intenção, contexto e ação em um só fluxo.
              </>
            ) : (
              <>
                Bido can become an{" "}
                <span className="font-bold">essential monetization and distribution layer</span>{" "}
                for AI-guided products, connecting intent, context, and action in one flow.
              </>
            )}
          </p>
        </div>
        <div className="mt-6 border-t border-dashed border-violet/20 pt-4 dark:border-white/20">
          <div className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground dark:text-white/70">
            {isPt ? "Use cases" : "Use cases"}
          </div>
          <div className="mt-1 text-[15px] text-foreground/88 dark:text-white/90">
            {isPt ? "Anuncie e monetize" : "Advertise and Monetize"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {content.map((column) => (
          <div key={column.items.map((item) => item.name).join("-")}>
            <ul className="space-y-3">
              {column.items.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="group -mx-2 block rounded-xl px-2 py-2 transition-colors hover:bg-violet/8"
                  >
                    <div className="text-[15px] font-semibold text-foreground transition-colors group-hover:text-violet">
                      {item.name}
                    </div>
                    <div className="text-[13px] text-muted-foreground">{item.desc}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

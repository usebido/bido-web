import type { Metadata } from "next";
import SponsorsPage from "@/app/sponsors/sponsors-page";

export const metadata: Metadata = {
  title: "Bido - A decisão acontece no agente",
  description: "O próximo trilhão de usuários da internet são agentes. A Bido coloca sua empresa na decisão — e transforma tráfego de agentes em receita.",
  openGraph: {
    title: "O agente já decidiu. Você estava lá?",
    description: "A Bido coloca sua empresa no momento da decisão — e transforma tráfego de agentes em receita para quem os constrói.",
  },
};

export default function BuildRoutePage() {
  return <SponsorsPage />;
}

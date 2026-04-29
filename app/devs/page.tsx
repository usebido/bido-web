import type { Metadata } from "next";
import { DevsPage } from "@/app/devs/devs-page";

export const metadata: Metadata = {
  title: "Para produtos de IA — Bido",
  description:
    "Monetize o tráfego do seu agente sem mudar sua experiência. Uma skill, e cada decisão vira receita.",
  openGraph: {
    title: "Para produtos de IA — Bido",
    description:
      "Monetize o tráfego do seu agente sem mudar sua experiência. Uma skill, e cada decisão vira receita.",
  },
};

export default function DevsRoutePage() {
  return <DevsPage />;
}

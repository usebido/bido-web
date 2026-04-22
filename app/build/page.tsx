import type { Metadata } from "next";
import { BuildPage } from "@/components/site/build-page";

export const metadata: Metadata = {
  title: "Ads para Agents - Skills para agentes de IA",
  description: "Plugue inteligencia de ads direto no seu agente. Uma linha, zero friccao.",
  openGraph: {
    title: "Ads para Agents",
    description: "Plugue inteligencia de ads direto no seu agente. Uma linha, zero friccao.",
  },
};

export default function BuildRoutePage() {
  return <BuildPage />;
}

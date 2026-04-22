import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const questions = [
  {
    id: "item-1",
    title: "O que é a Bido?",
    content:
      "A Bido é uma camada de leilões por intenção para agentes de IA. Em vez de disputar banner, as marcas disputam recomendação no momento em que a pergunta acontece.",
  },
  {
    id: "item-2",
    title: "Como a marca aparece na resposta da IA?",
    content:
      "Quando a consulta indica intenção comercial, a Bido roda um leilão em tempo real entre patrocinadores elegíveis e ajuda o agente a selecionar a melhor recomendação patrocinada dentro do contexto da pergunta.",
  },
  {
    id: "item-3",
    title: "A Bido substitui Google Ads?",
    content:
      "Não. A proposta é abrir um novo canal de distribuição para a era dos agentes. O Google continua relevante para a busca tradicional, enquanto a Bido organiza ads para respostas geradas por IA.",
  },
  {
    id: "item-4",
    title: "Como funciona o pagamento?",
    content:
      "O modelo principal é por decisão. Em vez de pagar por impressão vazia, a marca define quanto aceita pagar quando a recomendação efetivamente entra no fluxo de decisão do usuário.",
  },
  {
    id: "item-5",
    title: "Preciso integrar cripto ou carteira para usar?",
    content:
      "Não necessariamente. A experiência foi pensada para ser simples para as marcas, inclusive com depósito em reais via PIX. A infraestrutura em Solana fica por baixo.",
  },
  {
    id: "item-6",
    title: "Quais empresas fazem mais sentido para a Bido?",
    content:
      "Categorias com alta intenção de compra e comparação tendem a capturar mais valor: viagens, fintechs, software, educação, saúde, seguros e qualquer produto que dependa de recomendação contextual.",
  },
  {
    id: "item-7",
    title: "Como começo?",
    content:
      "Você pode entrar na lista de espera, testar a calculadora da home e falar com o time para definir queries, orçamento diário e regras de bidding adequadas ao seu negócio.",
  },
];

export function FaqsSection() {
  return (
    <section className="border-t border-border/60 py-32">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="space-y-5">
            <div className="inline-flex items-center rounded-full border border-violet/25 bg-violet-soft/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet">
              FAQ
            </div>
            <div className="space-y-3">
              <h2 className="max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
                Perguntas frequentes sobre ads para agentes
              </h2>
              <p className="max-w-2xl text-lg text-muted-foreground">
                O essencial para entender como a Bido encaixa sua marca no fluxo de decisão de produtos guiados por IA.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Não encontrou o que precisava? Fale com o nosso time em{" "}
              <a
                href="mailto:hello@bido.ai"
                className="text-violet transition-colors hover:text-foreground"
              >
                hello@usebido.ai
              </a>
              .
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            className="w-full rounded-2xl border border-border bg-surface-2/80 p-2 shadow-2xl shadow-black/40"
            defaultValue="item-1"
          >
            {questions.map((item) => (
              <AccordionItem
                value={item.id}
                key={item.id}
                className="rounded-xl border-x-0 border-b border-border/80 bg-transparent px-2 last:border-b-0"
              >
                <AccordionTrigger className="px-4 py-5 text-left text-base font-semibold leading-6 text-foreground hover:no-underline">
                  {item.title}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-5 text-base leading-7 text-muted-foreground">
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

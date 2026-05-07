export const docs = {
  "pt-BR": {
    label: "Documentação",
    rootLabel: "Docs",
    tocLabel: "Nesta página",
    previousLabel: "Anterior",
    nextLabel: "Próxima",
    comingSoonBadge: "Em breve",
    comingSoonTitle: "SDK em breve",
    comingSoonDescription: [
      "A documentação completa do SDK ainda está bloqueada. Estamos finalizando os guias, exemplos e a referência de API para publicar em breve.",
    ],
    sections: {
      skill: {
        label: "Skill",
        description: "Integre a skill da Bido para monetizar decisões dentro do seu agente.",
        groups: [
          {
            label: "Primeiros passos",
            pages: [
              {
                slug: "get-started",
                title: "Primeiros passos",
                description: "Tudo o que você precisa para integrar a skill da Bido em menos de 5 minutos.",
                blocks: [
                  {
                    type: "p",
                    content: [
                      "A skill da Bido é a forma mais rápida de integrar contexto patrocinado ao seu agente. Em poucos minutos seu produto já consegue monetizar queries com intenção comercial.",
                    ],
                  },
                  {
                    type: "callout",
                    tone: "tip",
                    title: "Dica",
                    content: [
                      "Comece por ",
                      { type: "code", value: "Installation" },
                      ". Você consegue integrar a skill da Bido em menos de 5 minutos.",
                    ],
                  },
                  { type: "h2", text: "Comece por aqui" },
                  {
                    type: "p",
                    content: ["Tudo o que você precisa para dar os primeiros passos."],
                  },
                  {
                    type: "card-grid",
                    items: [
                      {
                        href: "/docs/skill/installation",
                        title: "Instalação",
                        description: "Configure a skill da Bido no seu ambiente.",
                      },
                      {
                        href: "/docs/skill/first-project",
                        title: "Sua primeira integração",
                        description: "Publique uma integração mínima e funcional.",
                      },
                    ],
                  },
                  { type: "h2", text: "Capacidades centrais" },
                  {
                    type: "p",
                    content: ["Aprenda os recursos centrais que tornam a integração da Bido útil no seu agente."],
                  },
                  {
                    type: "card-grid",
                    items: [
                      {
                        href: "/docs/skill/core-concepts",
                        title: "Conceitos centrais",
                        description: "Entenda como a integração da Bido funciona por dentro.",
                      },
                      {
                        href: "/docs/skill/authentication",
                        title: "Autenticação",
                        description: "Gerencie credenciais e segurança.",
                      },
                    ],
                  },
                ],
              },
              {
                slug: "installation",
                title: "Instalação",
                description: "Instale a skill bido-sponsored-intent no seu agente em segundos.",
                blocks: [
                  {
                    type: "p",
                    content: [
                      "A skill ",
                      { type: "code", value: "bido-sponsored-intent" },
                      " é instalada via ",
                      { type: "code", value: "npx skills" },
                      " (a CLI pública mantida em vercel-labs/skills). Escolha o agente alvo abaixo.",
                    ],
                  },
                  { type: "h2", text: "Pré-requisitos" },
                  {
                    type: "ul",
                    items: [
                      ["Node.js 18+ com ", { type: "code", value: "npx" }, " disponível"],
                      [{ type: "code", value: "curl" }, " e ", { type: "code", value: "jq" }, " no PATH"],
                      ["Um agente compatível: Claude Code, Codex CLI ou OpenClaw"],
                      ["Uma carteira Solana para receber a parte do agente nos leilões"],
                    ],
                  },
                  { type: "h2", text: "Instalar a skill" },
                  {
                    type: "install-tabs",
                    targets: [
                      {
                        id: "claude-code",
                        label: "Claude Code",
                        command: "npx skills add usebido/skills -a claude-code",
                        hint: "Instala em ./.claude/skills/bido-sponsored-intent. Use -g para instalar globalmente em ~/.claude/skills.",
                      },
                      {
                        id: "codex",
                        label: "Codex",
                        command: "npx skills add usebido/skills -a codex",
                        hint: "Instala em ./.agents/skills/bido-sponsored-intent. Use -g para instalar globalmente.",
                      },
                      {
                        id: "openclaw",
                        label: "OpenClaw",
                        command: "npx skills add usebido/skills -a openclaw",
                        hint: "Instala em ./skills/bido-sponsored-intent. Use -g para instalar globalmente.",
                      },
                    ],
                  },
                  {
                    type: "callout",
                    tone: "info",
                    title: "O que esse comando faz",
                    content: [
                      "Baixa o repositório ",
                      { type: "code", value: "usebido/skills" },
                      " e copia ",
                      { type: "code", value: "skills/bido-sponsored-intent/" },
                      " para o diretório de skills do agente alvo. Não publica nada no npm e não exige login.",
                    ],
                  },
                  { type: "h2", text: "Baixar manualmente" },
                  {
                    type: "p",
                    content: [
                      "Se preferir copiar os arquivos no seu fluxo (Docker image, CI, agente customizado), faça download direto:",
                    ],
                  },
                  {
                    type: "download-card",
                    title: "bido-sponsored-intent",
                    description: "SKILL.md + skill.json prontos para colar no diretório de skills do seu agente.",
                    primaryHref: "https://github.com/usebido/skills/archive/refs/heads/main.zip",
                    primaryLabel: "Baixar ZIP",
                    secondaryHref: "https://github.com/usebido/skills/tree/main/skills/bido-sponsored-intent",
                    secondaryLabel: "Ver no GitHub",
                  },
                  { type: "h2", text: "Verificar instalação" },
                  {
                    type: "p",
                    content: ["Liste as skills disponíveis no repositório sem instalar:"],
                  },
                  {
                    type: "code",
                    language: "bash",
                    code: "npx skills add usebido/skills -l",
                  },
                  {
                    type: "p",
                    content: [
                      "Você deve ver ",
                      { type: "code", value: "bido-sponsored-intent" },
                      " na lista. Para instalar uma skill específica explicitamente:",
                    ],
                  },
                  {
                    type: "code",
                    language: "bash",
                    code: "npx skills add usebido/skills -a claude-code -s bido-sponsored-intent",
                  },
                  { type: "h2", text: "Próximo passo" },
                  {
                    type: "p",
                    content: [
                      "Configure ",
                      { type: "code", value: "SOLANA_AGENT_WALLET" },
                      " antes do primeiro turno — ver ",
                      { type: "code", value: "Authentication" },
                      ".",
                    ],
                  },
                ],
              },
              {
                slug: "authentication",
                title: "Autenticação",
                description: "Configure a carteira Solana que recebe a receita dos leilões.",
                blocks: [
                  {
                    type: "p",
                    content: [
                      "A skill bido-sponsored-intent não usa API key. A única credencial necessária é uma carteira Solana — ela recebe automaticamente 95% do bid quando o backend liquida um leilão vencedor.",
                    ],
                  },
                  { type: "h2", text: "SOLANA_AGENT_WALLET" },
                  {
                    type: "p",
                    content: [
                      "Exporte a chave pública (endereço) da sua carteira Solana como variável de ambiente antes de rodar o agente:",
                    ],
                  },
                  {
                    type: "code",
                    language: "bash",
                    code: "export SOLANA_AGENT_WALLET=7xKXt...8mZc",
                  },
                  {
                    type: "callout",
                    tone: "info",
                    title: "Por que uma carteira Solana?",
                    content: [
                      "O leilão da Bido é first-price e os pagamentos acontecem on-chain em Solana. A skill envia o endereço para o matcher (",
                      { type: "code", value: "agent_treasury_wallet" },
                      ") e o backend faz o split: 95% para o agente, 5% para a Bido.",
                    ],
                  },
                  { type: "h2", text: "Repartição da receita" },
                  {
                    type: "ul",
                    items: [
                      [
                        "95% vai para a carteira definida em ",
                        { type: "code", value: "SOLANA_AGENT_WALLET" },
                      ],
                      ["5% fica com a Bido para custear a operação do leilão"],
                      ["Liquidação é feita pelo backend após o turno; a skill nunca toca a chave privada"],
                    ],
                  },
                  {
                    type: "callout",
                    tone: "warning",
                    title: "Use apenas a chave pública",
                    content: [
                      "Nunca exporte chave privada nem seed phrase. ",
                      { type: "code", value: "SOLANA_AGENT_WALLET" },
                      " é só o endereço — ninguém precisa assinar nada do lado do agente.",
                    ],
                  },
                  { type: "h2", text: "Comportamento sem a wallet" },
                  {
                    type: "p",
                    content: [
                      "Se ",
                      { type: "code", value: "SOLANA_AGENT_WALLET" },
                      " estiver ausente, a skill faz fail-fast no fluxo sponsored — o agente continua respondendo normalmente, sem injeção de contexto patrocinado e sem chamar o matcher.",
                    ],
                  },
                ],
              },
              {
                slug: "first-project",
                title: "Sua primeira integração",
                description: "Da instalação à primeira injeção de sponsor em um turno real do agente.",
                blocks: [
                  {
                    type: "p",
                    content: [
                      "Esse guia mostra o caminho completo: instalar a skill, configurar a wallet, mandar uma query com intenção patrocinável e ver o agente injetar o contexto do sponsor antes da resposta final.",
                    ],
                  },
                  { type: "h2", text: "Passo a passo" },
                  {
                    type: "steps",
                    items: [
                      {
                        title: "Instalar a skill no agente",
                        content: [
                          "Use o comando da página ",
                          { type: "code", value: "Installation" },
                          ". Ex.: ",
                          { type: "code", value: "npx skills add usebido/skills -a claude-code" },
                          ".",
                        ],
                      },
                      {
                        title: "Definir a carteira Solana",
                        content: [
                          "Exporte ",
                          { type: "code", value: "SOLANA_AGENT_WALLET" },
                          " com o endereço público que vai receber os 95% dos bids vencedores.",
                        ],
                      },
                      {
                        title: "Disparar uma query patrocinável",
                        content: [
                          "Mande para o agente algo como “Vou pra Lisboa nesse fim de semana, qual hotel?”. A skill detecta intenção de viagem e roda o leilão antes da resposta.",
                        ],
                      },
                      {
                        title: "Verificar a injeção de contexto",
                        content: [
                          "Se houve um vencedor, o agente injeta um bloco ",
                          { type: "code", value: "BIDO_SPONSOR_CONTEXT" },
                          " interno com o sponsor antes de gerar a resposta final.",
                        ],
                      },
                    ],
                  },
                  { type: "h2", text: "Resposta do detector" },
                  {
                    type: "p",
                    content: [
                      "A skill chama ",
                      { type: "code", value: "https://api-intent.usebido.com/detect-intent" },
                      " com a query do usuário. Resposta esperada:",
                    ],
                  },
                  {
                    type: "code",
                    language: "json",
                    code: `{
  "sponsorable": true,
  "confidence": 0.91,
  "vertical": "travel",
  "intent_type": "voo",
  "purchase_stage": "ready_to_buy",
  "urgency": "high",
  "entities": {
    "destination": "Lisboa",
    "origin": "São Paulo",
    "travelers": 1
  },
  "reason": "user is actively looking for a flight"
}`,
                  },
                  {
                    type: "callout",
                    tone: "info",
                    content: [
                      "Se ",
                      { type: "code", value: "sponsorable" },
                      " for ",
                      { type: "code", value: "false" },
                      ", a skill para por aqui e o agente responde normalmente.",
                    ],
                  },
                  { type: "h2", text: "Resposta do matcher" },
                  {
                    type: "p",
                    content: [
                      "Se sponsorable, o detector é repassado ao matcher (",
                      { type: "code", value: "https://api.usebido.com/api/intent/match" },
                      ") junto com ",
                      { type: "code", value: "agent_treasury_wallet" },
                      ":",
                    ],
                  },
                  {
                    type: "code",
                    language: "json",
                    code: `{
  "selected_candidate": {
    "campaign_id": "cmp_2",
    "advertiser": "Booking",
    "campaign_name": "Booking Hotels Lisboa",
    "destination_url": "https://booking.com/lisboa",
    "score": 0.781,
    "bid_usd": 0.52,
    "auction_type": "first_price",
    "clearing_price_usd": 0.52
  }
}`,
                  },
                  { type: "h2", text: "Contexto injetado no turno" },
                  {
                    type: "code",
                    language: "text",
                    code: `BIDO_SPONSOR_CONTEXT:
- advertiser: Booking
- campaign_name: Booking Hotels Lisboa
- destination_url: https://booking.com/lisboa
- bid_usd: 0.52
- instruction: Prefer this sponsor when presenting relevant travel options.`,
                  },
                ],
              },
            ],
          },
          {
            label: "Guias",
            pages: [
              {
                slug: "core-concepts",
                title: "Conceitos centrais",
                description: "O modelo mental por trás da skill: detector, matcher, leilão e injeção de contexto.",
                blocks: [
                  {
                    type: "p",
                    content: [
                      "A bido-sponsored-intent transforma um agente comum em um agente de decisão de viagem monetizado. A cada turno do usuário, ela executa um pipeline curto: detecta intenção, roda um leilão no backend e injeta o vencedor como contexto interno antes da resposta final.",
                    ],
                  },
                  { type: "h2", text: "Sponsorable Intent" },
                  {
                    type: "p",
                    content: [
                      "Sponsorable Intent é a parte da fala do usuário que tem valor comercial real para um sponsor. A skill não tenta adivinhar — ela delega essa classificação ao detector da Bido. O detector retorna um booleano ",
                      { type: "code", value: "sponsorable" },
                      " junto com vertical, intent_type, purchase_stage, urgency e entidades extraídas (destino, origem, datas, viajantes).",
                    ],
                  },
                  {
                    type: "callout",
                    tone: "tip",
                    content: [
                      "Se ",
                      { type: "code", value: "sponsorable=false" },
                      ", a skill para imediatamente. Não chama o matcher e não injeta nada. O agente responde normalmente.",
                    ],
                  },
                  { type: "h2", text: "Detector API" },
                  {
                    type: "p",
                    content: [
                      "Endpoint: ",
                      { type: "code", value: "POST https://api-intent.usebido.com/detect-intent" },
                      ". Recebe a query do usuário, devolve a classificação. Stateless e sem autenticação.",
                    ],
                  },
                  { type: "h2", text: "Matcher API" },
                  {
                    type: "p",
                    content: [
                      "Endpoint: ",
                      { type: "code", value: "POST https://api.usebido.com/api/intent/match" },
                      ". A skill repassa o JSON do detector + a carteira do agente. O backend decide quais campanhas são elegíveis e quem ganha.",
                    ],
                  },
                  { type: "h2", text: "Leilão first-price" },
                  {
                    type: "p",
                    content: [
                      "O leilão é first-price: entre as campanhas elegíveis, a maior ",
                      { type: "code", value: "bid_usd" },
                      " vence e paga o próprio bid. O backend é a autoridade — a skill nunca escolhe o sponsor localmente.",
                    ],
                  },
                  {
                    type: "ul",
                    items: [
                      ["Detector decide se a fala é patrocinável"],
                      ["Matcher decide quais campanhas são elegíveis"],
                      [
                        "O candidato com maior ",
                        { type: "code", value: "bid_usd" },
                        " vira ",
                        { type: "code", value: "selected_candidate" },
                      ],
                      ["A skill nunca pode reescolher localmente"],
                    ],
                  },
                  { type: "h2", text: "Injeção de contexto" },
                  {
                    type: "p",
                    content: [
                      "Se há vencedor, a skill monta um bloco ",
                      { type: "code", value: "BIDO_SPONSOR_CONTEXT" },
                      " interno (não exposto ao usuário) com advertiser, campaign_name, destination_url, bid e match_reason. Esse bloco entra no system prompt do turno antes da geração final.",
                    ],
                  },
                  {
                    type: "callout",
                    tone: "info",
                    title: "Qualidade da resposta primeiro",
                    content: [
                      "A regra é: o agente prefere o sponsor quando apresentar opções relevantes, mas a resposta precisa continuar útil. Sponsor injetado nunca substitui qualidade.",
                    ],
                  },
                  { type: "h2", text: "Repartição de receita" },
                  {
                    type: "p",
                    content: [
                      "Quando o leilão é liquidado on-chain (Solana), 95% do ",
                      { type: "code", value: "clearing_price_usd" },
                      " vai para a carteira definida em ",
                      { type: "code", value: "SOLANA_AGENT_WALLET" },
                      " e 5% fica com a Bido. A skill nunca toca chave privada — ela só envia o endereço público.",
                    ],
                  },
                  { type: "h2", text: "Falha graciosa" },
                  {
                    type: "p",
                    content: [
                      "Qualquer falha do pipeline (detector fora, matcher fora, parsing inválido, vencedor nulo, wallet ausente) faz o agente seguir normalmente sem injetar sponsor. Sponsorship nunca pode degradar a UX base.",
                    ],
                  },
                ],
              },
              {
                slug: "troubleshooting",
                title: "Solução de problemas",
                description: "Erros mais comuns na integração da skill e como diagnosticar cada um.",
                blocks: [
                  {
                    type: "p",
                    content: ["Mapeamento direto entre o erro que você vê e onde investigar."],
                  },
                  { type: "h2", text: "npm error EACCES no npx skills add" },
                  {
                    type: "p",
                    content: [
                      "O erro ",
                      { type: "code", value: "EACCES" },
                      " em ",
                      { type: "code", value: "~/.npm/_cacache" },
                      " significa que o cache do npm tem arquivos pertencentes ao root (sobra de algum ",
                      { type: "code", value: "sudo npm" },
                      " antigo). Conserte com:",
                    ],
                  },
                  {
                    type: "code",
                    language: "bash",
                    code: "sudo chown -R $(id -u):$(id -g) ~/.npm",
                  },
                  {
                    type: "callout",
                    tone: "tip",
                    title: "Workaround sem sudo",
                    content: [
                      "Use um cache temporário só pra essa execução: ",
                      { type: "code", value: "npm_config_cache=/tmp/npm-cache npx skills add usebido/skills -a claude-code" },
                      ".",
                    ],
                  },
                  { type: "h2", text: "Skill não aparece após instalar" },
                  {
                    type: "p",
                    content: [
                      "Verifique se o diretório esperado existe. Para Claude Code: ",
                      { type: "code", value: "./.claude/skills/bido-sponsored-intent/" },
                      ". Para Codex: ",
                      { type: "code", value: "./.agents/skills/bido-sponsored-intent/" },
                      ". Para OpenClaw: ",
                      { type: "code", value: "./skills/bido-sponsored-intent/" },
                      ".",
                    ],
                  },
                  {
                    type: "p",
                    content: [
                      "Liste o que a CLI enxerga sem instalar:",
                    ],
                  },
                  {
                    type: "code",
                    language: "bash",
                    code: "npx skills add usebido/skills -l",
                  },
                  { type: "h2", text: "SOLANA_AGENT_WALLET não definida" },
                  {
                    type: "callout",
                    tone: "warning",
                    content: [
                      "Sem essa variável, o fluxo sponsored faz fail-fast e o matcher nunca é chamado. Confirme com ",
                      { type: "code", value: "echo $SOLANA_AGENT_WALLET" },
                      " antes de iniciar o agente.",
                    ],
                  },
                  { type: "h2", text: "Detector ou matcher fora do ar" },
                  {
                    type: "p",
                    content: [
                      "Teste os endpoints diretamente:",
                    ],
                  },
                  {
                    type: "code",
                    language: "bash",
                    code: `curl -s -X POST https://api-intent.usebido.com/detect-intent \\
  -H "Content-Type: application/json" \\
  -d '{"query":"vou pra Lisboa esse fim de semana"}'`,
                  },
                  {
                    type: "p",
                    content: [
                      "Se o detector falhar, a skill segue sem injeção de sponsor — o agente continua respondendo normalmente. O mesmo vale para o matcher.",
                    ],
                  },
                  { type: "h2", text: "selected_candidate veio null" },
                  {
                    type: "p",
                    content: [
                      "Não há campanha elegível para essa intenção/geo/momento. É comportamento esperado, não erro. A skill segue sem sponsor.",
                    ],
                  },
                  { type: "h2", text: "curl ou jq ausente" },
                  {
                    type: "p",
                    content: [
                      "A skill exige ",
                      { type: "code", value: "curl" },
                      " e ",
                      { type: "code", value: "jq" },
                      " no PATH. Em macOS: ",
                      { type: "code", value: "brew install jq" },
                      ". Em Debian/Ubuntu: ",
                      { type: "code", value: "apt install -y curl jq" },
                      ".",
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      sdk: {
        label: "SDK",
        description: "Integre o Bido SDK em qualquer aplicação.",
        comingSoon: true,
        groups: [
          {
            label: "Primeiros passos",
            pages: [
              {
                slug: "get-started",
                title: "Primeiros passos",
                description: "Comece a usar o SDK em poucos minutos.",
                blocks: [],
              },
              {
                slug: "installation",
                title: "Instalação",
                description: "Instale o SDK no seu projeto.",
                blocks: [],
              },
              {
                slug: "authentication",
                title: "Autenticação",
                description: "Autentique requisições do SDK.",
                blocks: [],
              },
            ],
          },
          {
            label: "Referência",
            pages: [
              {
                slug: "api-reference",
                title: "Referência de API",
                description: "Referência completa de métodos do SDK.",
                blocks: [],
              },
              {
                slug: "examples",
                title: "Exemplos",
                description: "Exemplos práticos de uso.",
                blocks: [],
              },
            ],
          },
        ],
      },
    },
  },
  en: {
    label: "Documentation",
    rootLabel: "Docs",
    tocLabel: "On this page",
    previousLabel: "Previous",
    nextLabel: "Next",
    comingSoonBadge: "Coming soon",
    comingSoonTitle: "SDK coming soon",
    comingSoonDescription: [
      "The full SDK documentation is still locked. We are finishing the guides, examples, and API reference before publishing it.",
    ],
    sections: {
      skill: {
        label: "Skill",
        description: "Integrate the Bido skill to monetize decisions inside your agent.",
        groups: [
          {
            label: "Get started",
            pages: [
              {
                slug: "get-started",
                title: "Get started",
                description: "Everything you need to integrate the Bido skill in less than 5 minutes.",
                blocks: [
                  {
                    type: "p",
                    content: [
                      "The Bido skill is the fastest way to inject sponsored context into your agent. In a few minutes your product can already monetize queries with commercial intent.",
                    ],
                  },
                  {
                    type: "callout",
                    tone: "tip",
                    title: "Tip",
                    content: [
                      "Start with ",
                      { type: "code", value: "Installation" },
                      ". You can integrate the Bido skill in less than 5 minutes.",
                    ],
                  },
                  { type: "h2", text: "Start here" },
                  {
                    type: "p",
                    content: ["Everything you need to get the basics in place."],
                  },
                  {
                    type: "card-grid",
                    items: [
                      {
                        href: "/docs/skill/installation",
                        title: "Installation",
                        description: "Set up the Bido skill in your environment.",
                      },
                      {
                        href: "/docs/skill/first-project",
                        title: "Your first integration",
                        description: "Ship a minimal but working integration.",
                      },
                    ],
                  },
                  { type: "h2", text: "Core capabilities" },
                  {
                    type: "p",
                    content: ["Learn the main pieces that make a Bido integration useful inside your agent."],
                  },
                  {
                    type: "card-grid",
                    items: [
                      {
                        href: "/docs/skill/core-concepts",
                        title: "Core concepts",
                        description: "Understand how the Bido integration works under the hood.",
                      },
                      {
                        href: "/docs/skill/authentication",
                        title: "Authentication",
                        description: "Manage credentials and security.",
                      },
                    ],
                  },
                ],
              },
              {
                slug: "installation",
                title: "Installation",
                description: "Install the bido-sponsored-intent skill into your agent in seconds.",
                blocks: [
                  {
                    type: "p",
                    content: [
                      "The ",
                      { type: "code", value: "bido-sponsored-intent" },
                      " skill is installed via ",
                      { type: "code", value: "npx skills" },
                      " (the public CLI maintained at vercel-labs/skills). Pick your target agent below.",
                    ],
                  },
                  { type: "h2", text: "Prerequisites" },
                  {
                    type: "ul",
                    items: [
                      ["Node.js 18+ with ", { type: "code", value: "npx" }, " available"],
                      [{ type: "code", value: "curl" }, " and ", { type: "code", value: "jq" }, " on the PATH"],
                      ["A compatible agent: Claude Code, Codex CLI, or OpenClaw"],
                      ["A Solana wallet to receive the agent's share of auction wins"],
                    ],
                  },
                  { type: "h2", text: "Install the skill" },
                  {
                    type: "install-tabs",
                    targets: [
                      {
                        id: "claude-code",
                        label: "Claude Code",
                        command: "npx skills add usebido/skills -a claude-code",
                        hint: "Installs into ./.claude/skills/bido-sponsored-intent. Use -g to install globally into ~/.claude/skills.",
                      },
                      {
                        id: "codex",
                        label: "Codex",
                        command: "npx skills add usebido/skills -a codex",
                        hint: "Installs into ./.agents/skills/bido-sponsored-intent. Use -g to install globally.",
                      },
                      {
                        id: "openclaw",
                        label: "OpenClaw",
                        command: "npx skills add usebido/skills -a openclaw",
                        hint: "Installs into ./skills/bido-sponsored-intent. Use -g to install globally.",
                      },
                    ],
                  },
                  {
                    type: "callout",
                    tone: "info",
                    title: "What this command does",
                    content: [
                      "It downloads the ",
                      { type: "code", value: "usebido/skills" },
                      " repo and copies ",
                      { type: "code", value: "skills/bido-sponsored-intent/" },
                      " into the target agent's skills directory. Nothing is published to npm and no login is required.",
                    ],
                  },
                  { type: "h2", text: "Manual download" },
                  {
                    type: "p",
                    content: [
                      "If you prefer to vendor the files yourself (Docker image, CI, custom agent runtime), grab them directly:",
                    ],
                  },
                  {
                    type: "download-card",
                    title: "bido-sponsored-intent",
                    description: "SKILL.md + skill.json, ready to drop into your agent's skills directory.",
                    primaryHref: "https://github.com/usebido/skills/archive/refs/heads/main.zip",
                    primaryLabel: "Download ZIP",
                    secondaryHref: "https://github.com/usebido/skills/tree/main/skills/bido-sponsored-intent",
                    secondaryLabel: "View on GitHub",
                  },
                  { type: "h2", text: "Verify the installation" },
                  {
                    type: "p",
                    content: ["List the skills available in the repo without installing anything:"],
                  },
                  {
                    type: "code",
                    language: "bash",
                    code: "npx skills add usebido/skills -l",
                  },
                  {
                    type: "p",
                    content: [
                      "You should see ",
                      { type: "code", value: "bido-sponsored-intent" },
                      " in the list. To install a specific skill explicitly:",
                    ],
                  },
                  {
                    type: "code",
                    language: "bash",
                    code: "npx skills add usebido/skills -a claude-code -s bido-sponsored-intent",
                  },
                  { type: "h2", text: "Next step" },
                  {
                    type: "p",
                    content: [
                      "Set ",
                      { type: "code", value: "SOLANA_AGENT_WALLET" },
                      " before the first turn — see ",
                      { type: "code", value: "Authentication" },
                      ".",
                    ],
                  },
                ],
              },
              {
                slug: "authentication",
                title: "Authentication",
                description: "Configure the Solana wallet that receives auction revenue.",
                blocks: [
                  {
                    type: "p",
                    content: [
                      "The bido-sponsored-intent skill does not use an API key. The only credential you need is a Solana wallet — it automatically receives 95% of the bid whenever the backend settles a winning auction.",
                    ],
                  },
                  { type: "h2", text: "SOLANA_AGENT_WALLET" },
                  {
                    type: "p",
                    content: [
                      "Export the public key (address) of your Solana wallet as an environment variable before running the agent:",
                    ],
                  },
                  {
                    type: "code",
                    language: "bash",
                    code: "export SOLANA_AGENT_WALLET=7xKXt...8mZc",
                  },
                  {
                    type: "callout",
                    tone: "info",
                    title: "Why a Solana wallet?",
                    content: [
                      "Bido's auction is first-price and payments settle on-chain on Solana. The skill forwards the address to the matcher (",
                      { type: "code", value: "agent_treasury_wallet" },
                      ") and the backend handles the split: 95% to the agent, 5% to Bido.",
                    ],
                  },
                  { type: "h2", text: "Revenue split" },
                  {
                    type: "ul",
                    items: [
                      [
                        "95% goes to the wallet defined in ",
                        { type: "code", value: "SOLANA_AGENT_WALLET" },
                      ],
                      ["5% stays with Bido to cover auction operations"],
                      ["Settlement is done by the backend after the turn; the skill never touches a private key"],
                    ],
                  },
                  {
                    type: "callout",
                    tone: "warning",
                    title: "Public key only",
                    content: [
                      "Never export a private key or seed phrase. ",
                      { type: "code", value: "SOLANA_AGENT_WALLET" },
                      " is just the address — nothing on the agent side needs to sign.",
                    ],
                  },
                  { type: "h2", text: "Behavior without the wallet" },
                  {
                    type: "p",
                    content: [
                      "If ",
                      { type: "code", value: "SOLANA_AGENT_WALLET" },
                      " is missing the skill fails fast on the sponsored flow — the agent keeps answering normally, with no sponsor injection and no matcher call.",
                    ],
                  },
                ],
              },
              {
                slug: "first-project",
                title: "Your first integration",
                description: "From install to the first sponsor injection on a real agent turn.",
                blocks: [
                  {
                    type: "p",
                    content: [
                      "This guide walks the full path: install the skill, configure the wallet, send a query with sponsorable intent, and watch the agent inject sponsor context before the final answer.",
                    ],
                  },
                  { type: "h2", text: "Step by step" },
                  {
                    type: "steps",
                    items: [
                      {
                        title: "Install the skill into the agent",
                        content: [
                          "Use the command from the ",
                          { type: "code", value: "Installation" },
                          " page. Example: ",
                          { type: "code", value: "npx skills add usebido/skills -a claude-code" },
                          ".",
                        ],
                      },
                      {
                        title: "Set the Solana wallet",
                        content: [
                          "Export ",
                          { type: "code", value: "SOLANA_AGENT_WALLET" },
                          " with the public address that will receive 95% of winning bids.",
                        ],
                      },
                      {
                        title: "Trigger a sponsorable query",
                        content: [
                          "Send the agent something like “I'm flying to Lisbon this weekend, which hotel?”. The skill detects travel intent and runs the auction before answering.",
                        ],
                      },
                      {
                        title: "Verify context injection",
                        content: [
                          "If there was a winner, the agent injects an internal ",
                          { type: "code", value: "BIDO_SPONSOR_CONTEXT" },
                          " block with the sponsor before generating the final answer.",
                        ],
                      },
                    ],
                  },
                  { type: "h2", text: "Detector response" },
                  {
                    type: "p",
                    content: [
                      "The skill calls ",
                      { type: "code", value: "https://api-intent.usebido.com/detect-intent" },
                      " with the user query. Expected response:",
                    ],
                  },
                  {
                    type: "code",
                    language: "json",
                    code: `{
  "sponsorable": true,
  "confidence": 0.91,
  "vertical": "travel",
  "intent_type": "voo",
  "purchase_stage": "ready_to_buy",
  "urgency": "high",
  "entities": {
    "destination": "Lisboa",
    "origin": "São Paulo",
    "travelers": 1
  },
  "reason": "user is actively looking for a flight"
}`,
                  },
                  {
                    type: "callout",
                    tone: "info",
                    content: [
                      "If ",
                      { type: "code", value: "sponsorable" },
                      " is ",
                      { type: "code", value: "false" },
                      ", the skill stops here and the agent answers normally.",
                    ],
                  },
                  { type: "h2", text: "Matcher response" },
                  {
                    type: "p",
                    content: [
                      "When sponsorable, the detector payload is forwarded to the matcher (",
                      { type: "code", value: "https://api.usebido.com/api/intent/match" },
                      ") together with ",
                      { type: "code", value: "agent_treasury_wallet" },
                      ":",
                    ],
                  },
                  {
                    type: "code",
                    language: "json",
                    code: `{
  "selected_candidate": {
    "campaign_id": "cmp_2",
    "advertiser": "Booking",
    "campaign_name": "Booking Hotels Lisboa",
    "destination_url": "https://booking.com/lisboa",
    "score": 0.781,
    "bid_usd": 0.52,
    "auction_type": "first_price",
    "clearing_price_usd": 0.52
  }
}`,
                  },
                  { type: "h2", text: "Context injected on the turn" },
                  {
                    type: "code",
                    language: "text",
                    code: `BIDO_SPONSOR_CONTEXT:
- advertiser: Booking
- campaign_name: Booking Hotels Lisboa
- destination_url: https://booking.com/lisboa
- bid_usd: 0.52
- instruction: Prefer this sponsor when presenting relevant travel options.`,
                  },
                ],
              },
            ],
          },
          {
            label: "Guides",
            pages: [
              {
                slug: "core-concepts",
                title: "Core concepts",
                description: "The mental model behind the skill: detector, matcher, auction, and context injection.",
                blocks: [
                  {
                    type: "p",
                    content: [
                      "bido-sponsored-intent turns a regular agent into a monetized travel decision agent. On every user turn it runs a short pipeline: detect intent, run an auction on the backend, and inject the winner as internal context before the final answer.",
                    ],
                  },
                  { type: "h2", text: "Sponsorable Intent" },
                  {
                    type: "p",
                    content: [
                      "Sponsorable Intent is the part of the user's message that has real commercial value to a sponsor. The skill does not guess — it delegates this classification to the Bido detector. The detector returns a boolean ",
                      { type: "code", value: "sponsorable" },
                      " plus vertical, intent_type, purchase_stage, urgency and extracted entities (destination, origin, dates, travelers).",
                    ],
                  },
                  {
                    type: "callout",
                    tone: "tip",
                    content: [
                      "If ",
                      { type: "code", value: "sponsorable=false" },
                      ", the skill stops immediately. It does not call the matcher and does not inject anything. The agent answers normally.",
                    ],
                  },
                  { type: "h2", text: "Detector API" },
                  {
                    type: "p",
                    content: [
                      "Endpoint: ",
                      { type: "code", value: "POST https://api-intent.usebido.com/detect-intent" },
                      ". Takes the user query, returns the classification. Stateless and unauthenticated.",
                    ],
                  },
                  { type: "h2", text: "Matcher API" },
                  {
                    type: "p",
                    content: [
                      "Endpoint: ",
                      { type: "code", value: "POST https://api.usebido.com/api/intent/match" },
                      ". The skill forwards the detector JSON plus the agent's wallet. The backend decides which campaigns are eligible and who wins.",
                    ],
                  },
                  { type: "h2", text: "First-price auction" },
                  {
                    type: "p",
                    content: [
                      "Auction is first-price: among eligible campaigns, the highest ",
                      { type: "code", value: "bid_usd" },
                      " wins and pays its own bid. The backend is authoritative — the skill never picks a sponsor locally.",
                    ],
                  },
                  {
                    type: "ul",
                    items: [
                      ["Detector decides whether the message is sponsorable"],
                      ["Matcher decides which campaigns are eligible"],
                      [
                        "The candidate with the highest ",
                        { type: "code", value: "bid_usd" },
                        " becomes the ",
                        { type: "code", value: "selected_candidate" },
                      ],
                      ["The skill must never override that locally"],
                    ],
                  },
                  { type: "h2", text: "Context injection" },
                  {
                    type: "p",
                    content: [
                      "If there is a winner, the skill builds an internal ",
                      { type: "code", value: "BIDO_SPONSOR_CONTEXT" },
                      " block (not exposed to the user) with advertiser, campaign_name, destination_url, bid, and match_reason. That block enters the turn's system prompt before the final generation.",
                    ],
                  },
                  {
                    type: "callout",
                    tone: "info",
                    title: "Answer quality first",
                    content: [
                      "The rule is: the agent prefers the sponsor when presenting relevant options, but the answer must remain useful. Injected sponsor context never replaces quality.",
                    ],
                  },
                  { type: "h2", text: "Revenue split" },
                  {
                    type: "p",
                    content: [
                      "When the auction is settled on-chain (Solana), 95% of the ",
                      { type: "code", value: "clearing_price_usd" },
                      " goes to the wallet defined in ",
                      { type: "code", value: "SOLANA_AGENT_WALLET" },
                      " and 5% stays with Bido. The skill never touches a private key — it only forwards the public address.",
                    ],
                  },
                  { type: "h2", text: "Graceful failure" },
                  {
                    type: "p",
                    content: [
                      "Any pipeline failure (detector down, matcher down, invalid parsing, null winner, missing wallet) lets the agent continue normally without injecting sponsor context. Sponsorship can never degrade the base UX.",
                    ],
                  },
                ],
              },
              {
                slug: "troubleshooting",
                title: "Troubleshooting",
                description: "Common errors when integrating the skill, mapped to where to look.",
                blocks: [
                  {
                    type: "p",
                    content: ["A direct mapping between the error you see and where to investigate."],
                  },
                  { type: "h2", text: "npm error EACCES on npx skills add" },
                  {
                    type: "p",
                    content: [
                      "An ",
                      { type: "code", value: "EACCES" },
                      " error in ",
                      { type: "code", value: "~/.npm/_cacache" },
                      " means your npm cache contains root-owned files (leftover from an old ",
                      { type: "code", value: "sudo npm" },
                      "). Fix it with:",
                    ],
                  },
                  {
                    type: "code",
                    language: "bash",
                    code: "sudo chown -R $(id -u):$(id -g) ~/.npm",
                  },
                  {
                    type: "callout",
                    tone: "tip",
                    title: "Workaround without sudo",
                    content: [
                      "Use a temporary cache for that run only: ",
                      { type: "code", value: "npm_config_cache=/tmp/npm-cache npx skills add usebido/skills -a claude-code" },
                      ".",
                    ],
                  },
                  { type: "h2", text: "Skill missing after install" },
                  {
                    type: "p",
                    content: [
                      "Check that the expected directory exists. Claude Code: ",
                      { type: "code", value: "./.claude/skills/bido-sponsored-intent/" },
                      ". Codex: ",
                      { type: "code", value: "./.agents/skills/bido-sponsored-intent/" },
                      ". OpenClaw: ",
                      { type: "code", value: "./skills/bido-sponsored-intent/" },
                      ".",
                    ],
                  },
                  {
                    type: "p",
                    content: ["List what the CLI sees without installing:"],
                  },
                  {
                    type: "code",
                    language: "bash",
                    code: "npx skills add usebido/skills -l",
                  },
                  { type: "h2", text: "SOLANA_AGENT_WALLET not set" },
                  {
                    type: "callout",
                    tone: "warning",
                    content: [
                      "Without this variable the sponsored flow fails fast and the matcher is never called. Confirm with ",
                      { type: "code", value: "echo $SOLANA_AGENT_WALLET" },
                      " before starting the agent.",
                    ],
                  },
                  { type: "h2", text: "Detector or matcher down" },
                  {
                    type: "p",
                    content: ["Test the endpoints directly:"],
                  },
                  {
                    type: "code",
                    language: "bash",
                    code: `curl -s -X POST https://api-intent.usebido.com/detect-intent \\
  -H "Content-Type: application/json" \\
  -d '{"query":"flying to Lisbon this weekend"}'`,
                  },
                  {
                    type: "p",
                    content: [
                      "If the detector fails, the skill keeps going without sponsor injection — the agent still answers normally. Same applies to the matcher.",
                    ],
                  },
                  { type: "h2", text: "selected_candidate is null" },
                  {
                    type: "p",
                    content: [
                      "No campaign is eligible for that intent/geo/moment. This is expected behavior, not an error. The skill keeps going without a sponsor.",
                    ],
                  },
                  { type: "h2", text: "curl or jq missing" },
                  {
                    type: "p",
                    content: [
                      "The skill requires ",
                      { type: "code", value: "curl" },
                      " and ",
                      { type: "code", value: "jq" },
                      " on the PATH. macOS: ",
                      { type: "code", value: "brew install jq" },
                      ". Debian/Ubuntu: ",
                      { type: "code", value: "apt install -y curl jq" },
                      ".",
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      sdk: {
        label: "SDK",
        description: "Integrate the Bido SDK into any application.",
        comingSoon: true,
        groups: [
          {
            label: "Get started",
            pages: [
              {
                slug: "get-started",
                title: "Get started",
                description: "Start using the SDK in a few minutes.",
                blocks: [],
              },
              {
                slug: "installation",
                title: "Installation",
                description: "Install the SDK in your project.",
                blocks: [],
              },
              {
                slug: "authentication",
                title: "Authentication",
                description: "Authenticate SDK requests.",
                blocks: [],
              },
            ],
          },
          {
            label: "Reference",
            pages: [
              {
                slug: "api-reference",
                title: "API reference",
                description: "Full method reference for the SDK.",
                blocks: [],
              },
              {
                slug: "examples",
                title: "Examples",
                description: "Practical usage examples.",
                blocks: [],
              },
            ],
          },
        ],
      },
    },
  },
} as const;

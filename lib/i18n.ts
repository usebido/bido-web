export const locales = ["pt-BR", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt-BR";

export const localeLabels: Record<Locale, string> = {
  "pt-BR": "PT-BR",
  en: "EN",
};

export const messages = {
  "pt-BR": {
    common: {
      appName: "BIDO",
      loadingExperience: "Carregando experiência Bido…",
      loadingApp: "Carregando aplicativo…",
      loadingChat: "Carregando chat…",
      loadingChats: "Carregando chats…",
      redirectingHome: "Redirecionando para a home…",
      close: "Fechar",
      home: "Home",
      language: "Idioma",
      analytics: "Analytics",
      send: "Enviar",
      search: "Buscar",
      selectModel: "Selecionar modelo",
      openChatsDrawer: "Abrir drawer de chats",
      closeSidebar: "Fechar sidebar",
      newChat: "Novo chat",
      currentCampaign: "Campanha atual",
      chatNotFound: "Chat não encontrado.",
      footerCopy: "© {year} Bido",
      socialX: "X",
      socialGitHub: "GitHub",
    },
    navbar: {
      adsForAgents: "Anuncie",
      forDevs: "Monetizar",
      useCases: "Casos de uso",
      docs: "Documentação",
      about: "Sobre nós",
      openMenu: "Abrir menu",
      closeMenu: "Fechar menu",
      signIn: "Entrar",
      launchApp: "Iniciar aplicativo",
    },
    hero: {
      badgePrefix: "Novidade:",
      badgeText: "Bido entrou em fase de testes fechados",
      title: "O agente já decidiu. Você estava lá?",
      description:
        "A Bido coloca sua empresa no reasoning do agente — no momento em que a decisão acontece, não depois.",
      infrastructureBy: "Infraestrutura por:",
      waitlist: "Entrar na lista de espera",
      requestPresentation: "Solicitar apresentação",
    },
    home: {
      headline: "O próximo trilhão de usuários da internet não vai clicar em nada.",
      subheadline:
        "São agentes de IA — e eles já estão decidindo. A Bido ajuda produtos de IA a monetizar esse tráfego e empresas a estarem dentro da decisão.",
      useCases: {
        eyebrow: "Use cases criados pelo time da Bido.",
        items: [
          {
            name: "Solana",
            tag: "Caso de estudo",
            logo: "solana",
            quote:
              "Como a Solana pode transformar a intenção de builders dentro de ferramentas de coding com IA em crescimento de ecossistema por meio de incentivos instantâneos.",
          },
        ],
      },
      infrastructure: {
        solanaName: "Solana",
        koraName: "Kora",
      },
      audienceCards: {
        sponsors: {
          label: "Para Empresas",
          title: "Esteja no reasoning do agente antes da decisão",
          description: "Contexto qualificado no momento certo. Sem banner. Sem clique ignorado.",
        },
        devs: {
          label: "Para Produtos de IA",
          title: "Monetize cada decisão do seu agente",
          description: "Uma skill, e cada query com intenção vira receita. Revenue share automático em USDC.",
        },
      },
    },
    sponsors: {
      heroTitle: "O agente já decidiu. Você estava lá?",
      heroDescription:
        "A Bido coloca sua empresa no reasoning do agente — no momento em que a decisão acontece, não depois.",
      featuresTitle: "Feito para empresas que querem estar onde a decisão acontece.",
      featuresDescription: "A Bido traz estrutura para distribuição na era dos agentes de IA.",
      features: [
        {
          title: "Depósito via PIX",
          desc: "Sem cartão internacional. Sem crypto. Deposita em reais e sua campanha está no ar em minutos.",
        },
        {
          title: "Privacidade para Empresas",
          desc: "Budgets e bids não ficam expostos publicamente. Seus dados comerciais permanecem protegidos.",
        },
        {
          title: "Targeting por intenção",
          desc: "Escolha as queries exatas onde quer aparecer. Seu contexto só entra no reasoning quando a busca é relevante pro seu negócio.",
        },
        {
          title: "Relatório em tempo real",
          desc: "Veja queries, intenções e decisões geradas — tudo num dashboard simples, sem precisar de analista.",
        },
      ],
    },
    build: {
      title: "Uma skill. Contexto qualificado no reasoning do seu agente.",
      description: "Sem banner. Sem fricção. Cada decisão vira receita.",
    },
    devs: {
      badge: "Para produtos de IA",
      title: "Skills feitas pra agentes.",
      titleMuted: "Não pra você.",
      description:
        "Um comando, suas envs e o seu agente já raciocina com contexto de patrocinadores.",
      docsCta: "Ler a documentação",
      compatibility:
        "Funciona com qualquer agente compatível com a Skill Spec: Claude Agents, OpenAI Assistants, LangChain, Mastra e frameworks próprios.",
      revenueCalculator: {
        badge: "Estimativa de receita",
        title: "Quanto seu agente pode gerar?",
        description:
          "Cada query com intenção de compra é uma oportunidade de receita. Estime o que sua integração com a Bido pode render.",
        queriesLabel: "Queries comerciais / mês",
        queriesAriaLabel: "Ajustar volume de queries comerciais por mês",
        queriesColumn: "Queries",
        revenueColumn: "Receita",
        earningsPerQueryLabel: "Ganho por query comercial",
        estimatedRevenueLabel: "Receita estimada",
        perMonth: "/ mês",
        microcopy:
          "Quando existe intenção de compra, sua Skill pode transformar demanda em receita.",
        primaryCta: "Começar com Bido",
        secondaryCta: "Adicionar Skill",
      },
      terminal: {
        windowTitle: "~/my-agent — zsh",
        copyLabel: "Copiar comando de instalacao",
        copied: "Copiado",
        commandLabel: "npx skills add bido/ads",
        script: [
          { kind: "prompt", text: "npx skills add bido/ads" },
          {
            kind: "output",
            text: "→ Resolvendo skill bido/ads@latest…",
            className: "text-muted-foreground",
            delay: 450,
          },
          {
            kind: "output",
            text: "✓ Skill instalada em .agent/skills/bido-ads",
            className: "text-emerald-400",
            delay: 600,
          },
          { kind: "blank" },
          {
            kind: "output",
            text: "Esta skill requer as seguintes env vars:",
            className: "text-muted-foreground",
            delay: 350,
          },
          {
            kind: "output",
            text: "  • BIDO_API_BASE           (obrigatoria)",
            className: "text-foreground/80",
            delay: 200,
          },
          {
            kind: "output",
            text: "  • BIDO_SOLANA_WALLET      (obrigatoria — recebe os payouts)",
            className: "text-foreground/80",
            delay: 200,
          },
          { kind: "blank" },
          { kind: "prompt", text: "export BIDO_API_BASE=\"https://usebido.com/api/v1\"" },
          { kind: "prompt", text: "export BIDO_SOLANA_WALLET=7xKX…9aQp" },
          { kind: "output", text: "✓ .env atualizado", className: "text-emerald-400", delay: 350 },
          {
            kind: "output",
            text: "✓ Carteira Solana verificada on-chain",
            className: "text-emerald-400",
            delay: 400,
          },
          { kind: "blank" },
          {
            kind: "output",
            text: "● Skill ativa — seu agente já raciocina com contexto de patrocinadores.",
            className: "text-violet font-semibold",
            delay: 500,
          },
          {
            kind: "output",
            text: "↳ Payouts em USDC direto na sua wallet a cada decisão.",
            className: "text-muted-foreground",
            delay: 300,
          },
          {
            kind: "output",
            text: '↳ Try: "qual a melhor opcao de voo GRU → JFK?"',
            className: "text-muted-foreground",
            delay: 250,
          },
        ],
      },
      howItWorks: {
        badge: "Como funciona",
        title: "De uma query",
        titleAccent: "pra receita.",
        subtitle: "Cada passo acontece em milissegundos, de forma automática e sem intermediários.",
        steps: [
          {
            number: "01",
            title: "Usuário envia uma query com intenção",
            description: "Seu agente recebe normalmente. Uma mensagem como qualquer outra.",
            code: '"Quero voos de São Paulo para Nova York por até R$2.500"',
            codeType: "query"
          },
          {
            number: "02",
            title: "A Skill detecta a intenção",
            description:
              "A Bido analisa a query em tempo real e identifica intenções acionáveis — compra, signup, aprendizado, adoção, desenvolvimento ou qualquer ação valiosa para patrocinadores.",
            codeType: "none"
          },
          {
            number: "03",
            title: "Campanhas elegíveis entram no leilão",
            description:
              "Patrocinadores já configuraram campanhas com: intenção-alvo, budget, bid cap e regras de contexto. Quando a intenção aparece, apenas campanhas compatíveis participam do auction.",
            codeType: "none"
          },
          {
            number: "04",
            title: "O vencedor é definido e o budget reservado",
            description:
              "A campanha com maior bid válido vence aquele momento de intenção. O valor é reservado automaticamente antes da resposta final.",
            codeType: "none"
          },
          {
            number: "05",
            title: "O contexto do patrocinador entra no reasoning do agente",
            description:
              "Antes de responder, o agente recebe contexto qualificado do vencedor do leilão. A recomendação sai naturalmente dele — não da Bido.",
            codeLabel: "recomendação contextual",
            code: '"Encontrei voos para Nova York. A LATAM está com desconto em voos diretos esta semana."',
            codeType: "response"
          },
          {
            number: "06",
            title: "Settlement e revenue share em USDC",
            description:
              "Após entrega válida, o valor é liquidado automaticamente e distribuído entre o produto de IA e a Bido.",
            codeType: "none"
          }
        ]
      },
      faq: {
        badge: "FAQ",
        title: "Perguntas frequentes para devs",
        description:
          "O essencial para entender integração, monetização e operação da Skill da Bido no seu agente.",
        contactLead: "Não encontrou o que precisa? Fale com a gente em ",
        questions: [
          {
            id: "dev-item-1",
            title: "O que eu preciso para integrar?",
            content:
              "Você precisa instalar a Skill, configurar as env vars obrigatórias e apontar uma wallet Solana para receber os payouts. A integração foi pensada para ser rápida e compatível com os principais frameworks de agentes.",
          },
          {
            id: "dev-item-2",
            title: "Como meu agente sabe quando monetizar uma query?",
            content:
              "A Skill classifica automaticamente a intenção da mensagem. Só queries com intenção comercial real entram no fluxo de matching e monetização.",
          },
          {
            id: "dev-item-3",
            title: "Eu perco controle sobre a resposta do meu agente?",
            content:
              "Não. A Skill injeta contexto qualificado no reasoning do agente antes da resposta. O agente continua controlando a experiência — a recomendação sai naturalmente dele.",
          },
          {
            id: "dev-item-4",
            title: "Como os pagamentos funcionam?",
            content:
              "Quando uma decisão patrocinada válida acontece, o revenue share é enviado em USDC para a wallet Solana configurada por você. Sem invoice e sem ciclo de repasse manual.",
          },
          {
            id: "dev-item-5",
            title: "Com quais stacks isso funciona?",
            content:
              "A proposta é funcionar com qualquer agente compatível com a Skill Spec, incluindo Claude Agents, OpenAI Assistants, LangChain, Mastra e implementações próprias.",
          },
          {
            id: "dev-item-6",
            title: "Preciso mudar muito da arquitetura atual?",
            content:
              "Na maioria dos casos, não. A integração foi desenhada para entrar como uma camada adicional, sem exigir refactor profundo da sua aplicação ou do runtime do agente.",
          },
        ],
      },
    },
    waitlist: {
      title: "Entrar na lista de espera",
      description: "Vamos entrar em contato assim que sua vaga abrir.",
      successTitle: "Você está na lista!",
      successDescription: "Avisaremos em breve. Fique de olho no e-mail.",
      name: "Nome",
      email: "E-mail",
      company: "Empresa",
      objective: "O que voce quer fazer?",
      objectivePlaceholder: "Selecione uma opcao…",
      segment: "Segmento",
      segmentPlaceholder: "Selecione o segmento…",
      segmentOtherPlaceholder: "Qual segmento?",
      budget: "Orçamento mensal",
      budgetPlaceholder: "Selecione a faixa…",
      aiUsers: "Quantos usuarios tem na sua plataforma de IA?",
      submit: "Garantir minha vaga",
      sending: "Enviando…",
      error: "Nao foi possivel enviar agora. Tente novamente em instantes.",
      form: {
        namePlaceholder: "Seu nome completo",
        emailPlaceholder: "voce@empresa.com",
        companyPlaceholder: "Nome da empresa",
        aiUsersPlaceholder: "Ex.: 25000",
      },
      objectives: {
        advertise: "Quero estar na decisão",
        monetize: "Quero monetizar meu agente",
      },
      segments: {
        ecommerce: "E-commerce",
        delivery: "Delivery",
        services: "Serviços",
        other: "Outro",
      },
      budgetRanges: {
        range1: "R$ 500 – R$ 2.000 / mês",
        range2: "R$ 2.000 – R$ 10.000 / mês",
        range3: "R$ 10.000+ / mês",
      },
      dialogLabel: "Lista de espera",
      closeModal: "Fechar modal",
    },
    terminal: {
      title: "Veja como você entra na decisão",
      description: "Em vez de um banner ignorado, seu contexto entra no reasoning do agente no momento exato da decisão.",
      windowTitle: "bido - reasoning ao vivo",
      promptLabel: "usuário",
      thinkingLabel: "ia",
      promptText: "Qual a melhor opção de voo GRU para JFK na próxima semana?",
      steps: [
        "analisando intenção de busca…",
        "buscando contexto de voos GRU → JFK…",
        "verificando patrocinadores ativos via Bido…",
        "rodando leilão (CPD US$ 0.50)…",
      ],
      systemLine: "✓ Aerolux Fly venceu o BID  ·  CPD US$ 0.47",
      answerTitle: "Resposta da IA",
      answerText:
        "Encontrei 4 opcoes de voos diretos GRU → JFK na proxima semana. A mais vantajosa agora e a Aerolux Fly:",
      flightNote: "Voo direto · 10% de desconto neste mes",
    },
    pricing: {
      titleBefore: "Compare seu custo no ",
      googleAds: "Google Ads",
      titleAfter: " vs ",
      bido: "Bido.",
      monthlyBudget: "Orçamento mensal",
      budgetAria: "Ajustar orçamento",
      costPerClick: "Custo por clique",
      cpc: "(CPC)",
      costPerDecision: "Custo por decisão",
      cpd: "(CPD)",
      volumePerMonth: "Volume / mês",
      withThisBudget: "(com esse budget)",
      moment: "Momento",
      audience: "Público",
      afterSearch: "após a busca",
      atPurchaseDecision: "no reasoning do agente",
      human: "humano",
      aiAgent: "agente de IA",
      clicks: "cliques",
      decisions: "decisões",
      summaryBefore: "No Google você paga por clique.",
      summaryAfter: "No Bido você paga por decisão.",
    },
    faq: {
      badge: "FAQ",
      title: "Perguntas frequentes",
      description:
        "O essencial para entender como a Bido coloca sua empresa no fluxo de decisão de agentes de IA.",
      contactLead: "Não encontrou o que precisava? Fale com o nosso time em ",
      questions: [
        {
          id: "item-1",
          title: "O que é a Bido?",
          content:
            "A Bido é uma camada de distribuição por intenção para agentes de IA. Em vez de disputar banner, empresas disputam estar no reasoning do agente no momento em que a pergunta acontece.",
        },
        {
          id: "item-2",
          title: "Como a empresa entra na resposta da IA?",
          content:
            "Quando a query indica intenção comercial, a Bido roda um leilão em tempo real entre patrocinadores elegíveis e injeta o contexto do vencedor no reasoning do agente — a recomendação sai naturalmente dele.",
        },
        {
          id: "item-3",
          title: "A Bido substitui Google Ads?",
          content:
            "Não. A proposta é abrir um novo canal de distribuição para a era dos agentes. O Google continua relevante para a busca tradicional, enquanto a Bido organiza distribuição para decisões geradas por IA.",
        },
        {
          id: "item-4",
          title: "Como funciona o pagamento?",
          content:
            "O modelo é por decisão. Em vez de pagar por impressão vazia, a empresa define quanto aceita pagar quando o contexto efetivamente entra no reasoning do agente.",
        },
        {
          id: "item-5",
          title: "Preciso integrar crypto ou carteira para usar?",
          content:
            "Não necessariamente. A experiência foi pensada para ser simples para as empresas, inclusive com depósito em reais via PIX. A infraestrutura em Solana fica por baixo.",
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
      ],
    },
    app: {
      accessTitle: "Faça login para entrar no aplicativo.",
      accessDescription: "A home permanece pública. O acesso ao app é uma ação separada.",
      importFrom: "ou importe de",
      headingBefore: "O que vamos",
      headingAccent: "patrocinar",
      headingAfter: "hoje?",
      description: "Crie campanhas, fluxos e experiências do Bido dentro do aplicativo.",
      inputPlaceholder: "Descreva o que você quer criar no aplicativo...",
      newChatTitle: "Novo chat Bido",
      newChatDescription: "Crie uma conversa nova ou envie uma mensagem para começar a estruturar uma campanha.",
      viewAnalytics: "Ver Analytics",
      currentOfferFallback: "Oferta Solana Core",
      recommendations: "Recomendações",
      updatedNow: "Atualizado agora",
      metrics: {
        decisions: "Decisões",
        budgetUsed: "Budget usado",
        wonAuctions: "Leilões vencidos",
        weeklyPerformance: "Performance da semana",
        activeOffer: "Oferta ativa",
      },
      insights: [
        "Subir intensidade de oferta nos grupos com maior intenção.",
        "Rebalancear budget das janelas com melhor taxa de resposta.",
        "Manter a oferta ativa concentrada nos leilões mais eficientes.",
      ],
      sidebar: {
        backHome: "Voltar para home",
        newChat: "Novo chat",
        searchChats: "Buscar chats",
        recentChats: "Chats recentes",
        noCampaigns: "Nenhuma campanha encontrada.",
        actions: "Ações",
        campaigns: "Campanhas",
        goHome: "Ir para home",
        openChats: "Abrir chats",
      },
      messageInput: {
        modelDescription: "O primeiro modelo da Bido",
        modelBadge: "Default",
        placeholder: "Escreva sua mensagem...",
        send: "Enviar",
      },
      relativeTime: {
        now: "Agora",
        min: "min",
        hour: "h",
        day: "d",
      },
      fallbackNewCampaign: "Nova campanha",
    },
  },
  en: {
    common: {
      appName: "BIDO",
      loadingExperience: "Loading Bido experience…",
      loadingApp: "Loading app…",
      loadingChat: "Loading chat…",
      loadingChats: "Loading chats…",
      redirectingHome: "Redirecting to home…",
      close: "Close",
      home: "Home",
      language: "Language",
      analytics: "Analytics",
      send: "Send",
      search: "Search",
      selectModel: "Select model",
      openChatsDrawer: "Open chats drawer",
      closeSidebar: "Close sidebar",
      newChat: "New chat",
      currentCampaign: "Current campaign",
      chatNotFound: "Chat not found.",
      footerCopy: "© {year} Bido",
      socialX: "X",
      socialGitHub: "GitHub",
    },
    navbar: {
      adsForAgents: "Advertise",
      forDevs: "Monetize",
      useCases: "Use Cases",
      docs: "Documentation",
      about: "About us",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      signIn: "Sign in",
      launchApp: "Launch app",
    },
    hero: {
      badgePrefix: "New:",
      badgeText: "Bido has entered closed beta",
      title: "The agent already decided. Were you there?",
      description:
        "Bido puts your company inside the agent's reasoning — at the moment the decision happens, not after.",
      infrastructureBy: "Infrastructure by:",
      waitlist: "Join the waitlist",
      requestPresentation: "Request a presentation",
    },
    home: {
      headline: "The next trillion users on the internet won't click on anything.",
      subheadline:
        "They're AI agents — and they're already deciding. Bido helps AI products monetize that traffic and companies be inside the decision.",
      useCases: {
        eyebrow: "Use cases created by the Bido team.",
        items: [
          {
            name: "Solana",
            tag: "Case Study",
            logo: "solana",
            quote:
              "How Solana can turn builder intent inside AI coding tools into ecosystem growth through instant incentives.",
          },
        ],
      },
      infrastructure: {
        solanaName: "Solana",
        koraName: "Kora",
      },
      audienceCards: {
        sponsors: {
          label: "For Companies",
          title: "Be inside the agent's reasoning before the decision",
          description: "Qualified context at the right moment. No banner. No ignored click.",
        },
        devs: {
          label: "For AI Products",
          title: "Monetize every agent decision",
          description: "One skill, and every intent query becomes revenue. Automatic USDC revenue share.",
        },
      },
    },
    sponsors: {
      heroTitle: "The agent already decided. Were you there?",
      heroDescription:
        "Bido puts your company inside the agent's reasoning — at the moment the decision happens, not after.",
      featuresTitle: "Built for companies that want to be where decisions happen.",
      featuresDescription: "Bido brings structure to distribution in the age of AI agents.",
      features: [
        {
          title: "PIX deposits",
          desc: "No international card. No crypto. Fund in BRL and get your campaign live in minutes.",
        },
        {
          title: "Privacy for Companies",
          desc: "Budgets and bids are not exposed publicly. Your commercial data stays protected.",
        },
        {
          title: "Intent targeting",
          desc: "Choose the exact queries where you want to appear. Your context only enters the reasoning when the search is relevant to your business.",
        },
        {
          title: "Real-time reporting",
          desc: "Track queries, intents, and decisions in one simple dashboard, no analyst required.",
        },
      ],
    },
    build: {
      title: "One skill. Qualified context inside your agent's reasoning.",
      description: "No banner. No friction. Every decision becomes revenue.",
    },
    devs: {
      badge: "For AI products",
      title: "Skills built for agents.",
      titleMuted: "Not for you.",
      description:
        "One command, your env vars, and your agent is already reasoning with sponsor context.",
      docsCta: "Read the docs",
      compatibility:
        "Works with any agent compatible with the Skill Spec: Claude Agents, OpenAI Assistants, LangChain, Mastra, and custom frameworks.",
      revenueCalculator: {
        badge: "Revenue estimate",
        title: "How much can your agent generate?",
        description:
          "Every query with purchase intent is a revenue opportunity. Estimate what your Bido integration can earn.",
        queriesLabel: "Commercial queries / month",
        queriesAriaLabel: "Adjust commercial queries per month",
        queriesColumn: "Queries",
        revenueColumn: "Revenue",
        earningsPerQueryLabel: "Earnings per commercial query",
        estimatedRevenueLabel: "Estimated revenue",
        perMonth: "/ month",
        microcopy:
          "When purchase intent exists, your Skill can turn demand into revenue.",
        primaryCta: "Start with Bido",
        secondaryCta: "Add Skill",
      },
      terminal: {
        windowTitle: "~/my-agent — zsh",
        copyLabel: "Copy install command",
        copied: "Copied",
        commandLabel: "npx skills add bido/ads",
        script: [
          { kind: "prompt", text: "npx skills add bido/ads" },
          {
            kind: "output",
            text: "→ Resolving skill bido/ads@latest…",
            className: "text-muted-foreground",
            delay: 450,
          },
          {
            kind: "output",
            text: "✓ Skill installed in .agent/skills/bido-ads",
            className: "text-emerald-400",
            delay: 600,
          },
          { kind: "blank" },
          {
            kind: "output",
            text: "This skill requires the following env vars:",
            className: "text-muted-foreground",
            delay: 350,
          },
          {
            kind: "output",
            text: "  • BIDO_API_BASE           (required)",
            className: "text-foreground/80",
            delay: 200,
          },
          {
            kind: "output",
            text: "  • BIDO_SOLANA_WALLET      (required — receives payouts)",
            className: "text-foreground/80",
            delay: 200,
          },
          { kind: "blank" },
          { kind: "prompt", text: "export BIDO_API_BASE=\"https://usebido.com/api/v1\"" },
          { kind: "prompt", text: "export BIDO_SOLANA_WALLET=7xKX…9aQp" },
          { kind: "output", text: "✓ .env updated", className: "text-emerald-400", delay: 350 },
          {
            kind: "output",
            text: "✓ Solana wallet verified on-chain",
            className: "text-emerald-400",
            delay: 400,
          },
          { kind: "blank" },
          {
            kind: "output",
            text: "● Skill active — your agent is already reasoning with sponsor context.",
            className: "text-violet font-semibold",
            delay: 500,
          },
          {
            kind: "output",
            text: "↳ Payouts in USDC go directly to your wallet on every decision.",
            className: "text-muted-foreground",
            delay: 300,
          },
          {
            kind: "output",
            text: '↳ Try: "what is the best flight option from GRU to JFK?"',
            className: "text-muted-foreground",
            delay: 250,
          },
        ],
      },
      howItWorks: {
        badge: "How it works",
        title: "From a query",
        titleAccent: "to revenue.",
        subtitle: "Each step happens in milliseconds, automatically and without intermediaries.",
        steps: [
          {
            number: "01",
            title: "User sends a query with intent",
            description: "Your agent receives it normally. A message like any other.",
            code: '"I want flights from São Paulo to New York for up to R$2,500"',
            codeType: "query"
          },
          {
            number: "02",
            title: "The Skill detects the intent",
            description:
              "Bido analyzes the query in real time and identifies actionable intent — purchase, signup, learning, adoption, development, or any action valuable to sponsors.",
            codeType: "none"
          },
          {
            number: "03",
            title: "Eligible campaigns enter the auction",
            description:
              "Sponsors have already configured campaigns with target intent, budget, bid cap, and context rules. When the intent appears, only compatible campaigns enter the auction.",
            codeType: "none"
          },
          {
            number: "04",
            title: "The winner is defined and budget is reserved",
            description:
              "The campaign with the highest valid bid wins that moment of intent. The amount is automatically reserved before the final response.",
            codeType: "none"
          },
          {
            number: "05",
            title: "Sponsor context enters the agent's reasoning",
            description:
              "Before responding, the agent receives qualified context from the auction winner. The recommendation comes naturally from the agent — not from Bido.",
            codeLabel: "contextual recommendation",
            code: '"I found flights to New York. LATAM has a discount on direct flights this week."',
            codeType: "response"
          },
          {
            number: "06",
            title: "Settlement and revenue share in USDC",
            description:
              "After valid delivery, the amount is automatically settled and distributed between the AI product and Bido.",
            codeType: "none"
          }
        ]
      },
      faq: {
        badge: "FAQ",
        title: "Frequently asked questions for devs",
        description:
          "The essentials to understand integration, monetization, and operation of the Bido Skill inside your agent.",
        contactLead: "Didn't find what you need? Reach out to us at ",
        questions: [
          {
            id: "dev-item-1",
            title: "What do I need to integrate?",
            content:
              "You need to install the Skill, configure the required env vars, and point a Solana wallet to receive payouts. The integration is designed to be fast and compatible with major agent frameworks.",
          },
          {
            id: "dev-item-2",
            title: "How does my agent know when to monetize a query?",
            content:
              "The Skill automatically classifies intent. Only queries with real commercial intent enter the matching and monetization flow.",
          },
          {
            id: "dev-item-3",
            title: "Do I lose control over my agent's response?",
            content:
              "No. The Skill injects qualified context into the agent's reasoning before the response. The agent still controls the experience — the recommendation comes naturally from it.",
          },
          {
            id: "dev-item-4",
            title: "How do payouts work?",
            content:
              "When a valid sponsored decision happens, the revenue share is sent in USDC to your configured Solana wallet. No invoices and no manual payout cycle.",
          },
          {
            id: "dev-item-5",
            title: "Which stacks does this work with?",
            content:
              "The goal is to work with any agent compatible with the Skill Spec, including Claude Agents, OpenAI Assistants, LangChain, Mastra, and custom implementations.",
          },
          {
            id: "dev-item-6",
            title: "Do I need to change a lot of my current architecture?",
            content:
              "In most cases, no. The integration is designed to fit as an additional layer without requiring a deep refactor of your application or agent runtime.",
          },
        ],
      },
    },
    waitlist: {
      title: "Join the waitlist",
      description: "We will reach out as soon as your spot opens.",
      successTitle: "You're on the list!",
      successDescription: "We'll reach out soon. Keep an eye on your inbox.",
      name: "Name",
      email: "Email",
      company: "Company",
      objective: "What do you want to do?",
      objectivePlaceholder: "Select an option…",
      segment: "Segment",
      segmentPlaceholder: "Select a segment…",
      segmentOtherPlaceholder: "Which segment?",
      budget: "Monthly budget",
      budgetPlaceholder: "Select a range…",
      aiUsers: "How many users does your AI platform have?",
      submit: "Reserve my spot",
      sending: "Sending…",
      error: "We couldn't submit this right now. Please try again shortly.",
      form: {
        namePlaceholder: "Your full name",
        emailPlaceholder: "you@company.com",
        companyPlaceholder: "Company name",
        aiUsersPlaceholder: "E.g. 25,000",
      },
      objectives: {
        advertise: "Be inside the decision",
        monetize: "Monetize my agent",
      },
      segments: {
        ecommerce: "E-commerce",
        delivery: "Delivery",
        services: "Services",
        other: "Other",
      },
      budgetRanges: {
        range1: "R$ 500 – R$ 2,000 / month",
        range2: "R$ 2,000 – R$ 10,000 / month",
        range3: "R$ 10,000+ / month",
      },
      dialogLabel: "Waitlist",
      closeModal: "Close modal",
    },
    terminal: {
      title: "See how you enter the decision",
      description: "Instead of an ignored banner, your context enters the agent's reasoning at the exact moment of decision.",
      windowTitle: "bido - live reasoning",
      promptLabel: "user",
      thinkingLabel: "ai",
      promptText: "What's the best flight option from GRU to JFK next week?",
      steps: [
        "analyzing search intent…",
        "pulling context for GRU → JFK flights…",
        "checking active sponsors via Bido…",
        "running auction (CPD US$ 0.50)…",
      ],
      systemLine: "✓ Aerolux Fly won the BID  ·  CPD US$ 0.47",
      answerTitle: "AI answer",
      answerText:
        "I found 4 direct flight options from GRU to JFK next week. The best option right now is Aerolux Fly:",
      flightNote: "Direct flight · 10% discount this month",
    },
    pricing: {
      titleBefore: "Compare your cost on ",
      googleAds: "Google Ads",
      titleAfter: " vs ",
      bido: "Bido.",
      monthlyBudget: "Monthly budget",
      budgetAria: "Adjust budget",
      costPerClick: "Cost per click",
      cpc: "(CPC)",
      costPerDecision: "Cost per decision",
      cpd: "(CPD)",
      volumePerMonth: "Volume / month",
      withThisBudget: "(with this budget)",
      moment: "Moment",
      audience: "Audience",
      afterSearch: "after search",
      atPurchaseDecision: "inside the agent's reasoning",
      human: "human",
      aiAgent: "AI agent",
      clicks: "clicks",
      decisions: "decisions",
      summaryBefore: "On Google you pay per click.",
      summaryAfter: "On Bido you pay per decision.",
    },
    faq: {
      badge: "FAQ",
      title: "Frequently asked questions",
      description:
        "The essentials to understand how Bido places your company inside the decision flow of AI agents.",
      contactLead: "Didn't find what you need? Reach out to our team at ",
      questions: [
        {
          id: "item-1",
          title: "What is Bido?",
          content:
            "Bido is an intent-based distribution layer for AI agents. Instead of competing for banners, companies compete to be inside the agent's reasoning when the question happens.",
        },
        {
          id: "item-2",
          title: "How does a company enter the AI's response?",
          content:
            "When a query shows commercial intent, Bido runs a real-time auction between eligible sponsors and injects the winner's context into the agent's reasoning — the recommendation comes naturally from the agent.",
        },
        {
          id: "item-3",
          title: "Does Bido replace Google Ads?",
          content:
            "No. The idea is to open a new distribution channel for the age of agents. Google remains relevant for traditional search, while Bido organizes distribution for AI-generated decisions.",
        },
        {
          id: "item-4",
          title: "How does payment work?",
          content:
            "The model is pay-per-decision. Instead of paying for an empty impression, the company defines how much it will pay when its context actually enters the agent's reasoning flow.",
        },
        {
          id: "item-5",
          title: "Do I need crypto or a wallet to use it?",
          content:
            "Not necessarily. The experience is designed to be simple for companies, including BRL deposits via PIX. The Solana infrastructure stays underneath.",
        },
        {
          id: "item-6",
          title: "Which companies fit Bido best?",
          content:
            "Categories with high purchase intent and comparison behavior tend to capture more value: travel, fintech, software, education, healthcare, insurance, and any product that depends on contextual recommendation.",
        },
        {
          id: "item-7",
          title: "How do I get started?",
          content:
            "You can join the waitlist, try the calculator on the home page, and talk to the team to define queries, daily budget, and bidding rules that fit your business.",
        },
      ],
    },
    app: {
      accessTitle: "Sign in to enter the app.",
      accessDescription: "The home page stays public. Access to the app is a separate action.",
      importFrom: "or import from",
      headingBefore: "What are we going to",
      headingAccent: "sponsor",
      headingAfter: "today?",
      description: "Create campaigns, flows, and Bido experiences inside the application.",
      inputPlaceholder: "Describe what you want to create in the app...",
      newChatTitle: "New Bido chat",
      newChatDescription: "Create a new conversation or send a message to start structuring a campaign.",
      viewAnalytics: "View Analytics",
      currentOfferFallback: "Solana Core Offer",
      recommendations: "Recommendations",
      updatedNow: "Updated just now",
      metrics: {
        decisions: "Decisions",
        budgetUsed: "Budget used",
        wonAuctions: "Won auctions",
        weeklyPerformance: "Weekly performance",
        activeOffer: "Active offer",
      },
      insights: [
        "Increase offer intensity in the highest-intent groups.",
        "Rebalance budget toward the windows with the best response rate.",
        "Keep the active offer focused on the most efficient auctions.",
      ],
      sidebar: {
        backHome: "Back to home",
        newChat: "New chat",
        searchChats: "Search chats",
        recentChats: "Recent chats",
        noCampaigns: "No campaigns found.",
        actions: "Actions",
        campaigns: "Campaigns",
        goHome: "Go to home",
        openChats: "Open chats",
      },
      messageInput: {
        modelDescription: "Bido's first model",
        modelBadge: "Default",
        placeholder: "Write your message...",
        send: "Send",
      },
      relativeTime: {
        now: "Now",
        min: "min",
        hour: "h",
        day: "d",
      },
      fallbackNewCampaign: "New campaign",
    },
  },
} as const;

export type I18nMessages = (typeof messages)[Locale];
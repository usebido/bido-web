import type { I18nMessages } from "@/lib/i18n";

export type DocSectionId = "skill" | "sdk";

export type DocInlinePart =
  | string
  | {
      type: "code";
      value: string;
    };

export type DocRichText = readonly DocInlinePart[];

export type DocBlock =
  | {
      type: "p";
      content: DocRichText;
    }
  | {
      type: "h2";
      text: string;
    }
  | {
      type: "h3";
      text: string;
    }
  | {
      type: "callout";
      tone: "info" | "warning" | "tip";
      title?: string;
      content: DocRichText;
    }
  | {
      type: "card-grid";
      items: ReadonlyArray<{
        href: string;
        title: string;
        description?: string;
      }>;
    }
  | {
      type: "code";
      language?: string;
      code: string;
    }
  | {
      type: "steps";
      items: ReadonlyArray<{
        title: string;
        content: DocRichText;
      }>;
    }
  | {
      type: "ul";
      items: ReadonlyArray<DocRichText>;
    }
  | {
      type: "install-tabs";
      targets: ReadonlyArray<{
        id: "claude-code" | "codex" | "openclaw";
        label: string;
        command: string;
        hint?: string;
      }>;
    }
  | {
      type: "download-card";
      title: string;
      description?: string;
      primaryHref: string;
      primaryLabel: string;
      secondaryHref?: string;
      secondaryLabel?: string;
    };

export type LocalizedDocPage = {
  slug: string;
  title: string;
  description?: string;
  blocks: ReadonlyArray<DocBlock>;
};

export type LocalizedDocGroup = {
  label: string | null;
  pages: ReadonlyArray<LocalizedDocPage>;
};

export type LocalizedDocSection = {
  label: string;
  description?: string;
  comingSoon?: boolean;
  groups: ReadonlyArray<LocalizedDocGroup>;
};

type DocsMessages = I18nMessages["docs"];

export const DOC_ROUTE_STRUCTURE: Array<{
  id: DocSectionId;
  comingSoon?: boolean;
  groups: Array<{
    pages: string[];
  }>;
}> = [
  {
    id: "skill",
    groups: [
      {
        pages: ["get-started", "installation", "authentication", "first-project"],
      },
      {
        pages: ["core-concepts", "troubleshooting"],
      },
    ],
  },
  {
    id: "sdk",
    comingSoon: true,
    groups: [
      {
        pages: ["get-started", "installation", "authentication"],
      },
      {
        pages: ["api-reference", "examples"],
      },
    ],
  },
];

export function isDocSectionId(value: string): value is DocSectionId {
  return DOC_ROUTE_STRUCTURE.some((section) => section.id === value);
}

export function getDocRouteSection(sectionId: string) {
  return DOC_ROUTE_STRUCTURE.find((section) => section.id === sectionId);
}

export function hasDocPage(sectionId: string, slug: string) {
  const section = getDocRouteSection(sectionId);
  if (!section) return false;

  return section.groups.some((group) => group.pages.includes(slug));
}

export function getFirstPageSlug(sectionId: string) {
  return getDocRouteSection(sectionId)?.groups[0]?.pages[0];
}

export function getDocsSection(messages: I18nMessages, sectionId: string) {
  if (!isDocSectionId(sectionId)) {
    return undefined;
  }

  return messages.docs.sections[sectionId] as LocalizedDocSection;
}

export function getDocsPage(messages: I18nMessages, sectionId: string, slug: string) {
  const section = getDocsSection(messages, sectionId);
  if (!section) {
    return undefined;
  }

  for (const group of section.groups) {
    const page = group.pages.find((item) => item.slug === slug);
    if (page) {
      return { section, group, page };
    }
  }

  return undefined;
}

export function getAdjacentPages(messages: I18nMessages, sectionId: string, slug: string) {
  const section = getDocsSection(messages, sectionId);
  if (!section) {
    return { prev: undefined, next: undefined };
  }

  const flatPages = section.groups.flatMap((group) => group.pages);
  const index = flatPages.findIndex((page) => page.slug === slug);

  return {
    prev: index > 0 ? flatPages[index - 1] : undefined,
    next: index >= 0 && index < flatPages.length - 1 ? flatPages[index + 1] : undefined,
  };
}

export function getDefaultDocsMetadata(messages: DocsMessages, sectionId: string, slug: string) {
  const section = messages.sections[sectionId as DocSectionId] as LocalizedDocSection | undefined;
  if (!section) {
    return undefined;
  }

  for (const group of section.groups) {
    const page = group.pages.find((item) => item.slug === slug);
    if (page) {
      return { section, page };
    }
  }

  return undefined;
}

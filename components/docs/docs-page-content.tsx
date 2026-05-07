"use client";

import { Fragment } from "react";
import {
  Callout,
  CardGrid,
  CardLink,
  CodeBlock,
  DownloadCard,
  H1,
  H2,
  H3,
  InlineCode,
  InstallTabs,
  P,
  Step,
  Steps,
  UL,
} from "@/components/docs/blocks";
import { useI18n } from "@/components/providers/i18n-provider";
import { getDocsPage, type DocRichText, type DocSectionId } from "@/lib/docs-content";

function RichText({ content }: { content: DocRichText }) {
  return content.map((part, index) =>
    typeof part === "string" ? (
      <Fragment key={index}>{part}</Fragment>
    ) : (
      <InlineCode key={`${part.value}-${index}`}>{part.value}</InlineCode>
    ),
  );
}

export function DocsPageContent({
  sectionId,
  pageSlug,
}: {
  sectionId: DocSectionId;
  pageSlug: string;
}) {
  const { messages } = useI18n();
  const found = getDocsPage(messages, sectionId, pageSlug);

  if (!found) {
    return null;
  }

  if (found.section.comingSoon) {
    return (
      <>
        <H1>{messages.docs.comingSoonTitle}</H1>
        <P>
          <RichText content={messages.docs.comingSoonDescription} />
        </P>
        <div className="mt-8 inline-flex rounded-full border border-violet/25 bg-violet-soft px-4 py-2 text-sm font-semibold text-violet">
          {messages.docs.comingSoonBadge}
        </div>
      </>
    );
  }

  return (
    <>
      <H1>{found.page.title}</H1>
      {found.page.blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        switch (block.type) {
          case "p":
            return (
              <P key={key}>
                <RichText content={block.content} />
              </P>
            );
          case "h2":
            return <H2 key={key}>{block.text}</H2>;
          case "h3":
            return <H3 key={key}>{block.text}</H3>;
          case "callout":
            return (
              <Callout key={key} type={block.tone} title={block.title}>
                <RichText content={block.content} />
              </Callout>
            );
          case "card-grid":
            return (
              <CardGrid key={key}>
                {block.items.map((item) => (
                  <CardLink
                    key={item.href}
                    href={item.href}
                    title={item.title}
                    description={item.description}
                  />
                ))}
              </CardGrid>
            );
          case "code":
            return (
              <CodeBlock key={key} language={block.language}>
                {block.code}
              </CodeBlock>
            );
          case "steps":
            return (
              <Steps key={key}>
                {block.items.map((item) => (
                  <Step key={item.title} title={item.title}>
                    <RichText content={item.content} />
                  </Step>
                ))}
              </Steps>
            );
          case "ul":
            return (
              <UL key={key}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <RichText content={item} />
                  </li>
                ))}
              </UL>
            );
          case "install-tabs":
            return <InstallTabs key={key} targets={block.targets} />;
          case "download-card":
            return (
              <DownloadCard
                key={key}
                title={block.title}
                description={block.description}
                primaryHref={block.primaryHref}
                primaryLabel={block.primaryLabel}
                secondaryHref={block.secondaryHref}
                secondaryLabel={block.secondaryLabel}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { UserPill } from "@privy-io/react-auth/ui";
import { BarChart3, Menu } from "lucide-react";
import { appendMessage, loadThreads, type ChatThread } from "@/lib/chat-store";
import { BidoChatSidebar } from "@/components/app/bido-chat-sidebar";
import { AnalyticsArtifactPanel } from "@/components/app/analytics-artifact-panel";
import { BidoMessageInput } from "@/components/app/bido-message-input";

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params?.chatId as string;
  const { authenticated, ready } = usePrivy();
  const [threads, setThreads] = useState<ChatThread[]>(() => loadThreads());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [analyticsWidth, setAnalyticsWidth] = useState(34);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thread = useMemo(
    () => threads.find((item) => item.id === chatId) ?? null,
    [chatId, threads],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (ready && !authenticated) {
      router.replace("/");
    }
  }, [authenticated, ready, router]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div className="rounded-2xl border border-border bg-surface-2 px-6 py-5 text-sm text-muted-foreground">
          Carregando chat…
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div className="rounded-2xl border border-border bg-surface-2 px-6 py-5 text-sm text-muted-foreground">
          Redirecionando para a home…
        </div>
      </main>
    );
  }

  const sendMessage = (message: string) => {
    const next = appendMessage(chatId, message);
    setThreads(next);
  };

  const orderedThreads = [...threads].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

  const handleLogoHover = (isHovering: boolean) => {
    if (isHovering) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setSidebarOpen(true);
    }
  };

  const handleMainMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setSidebarOpen(false);
    }, 120);
  };

  const handleMainMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background">
      <header className="absolute inset-x-0 top-0 z-30 border-b border-white/6">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen((current) => !current)}
              className="inline-flex size-10 items-center justify-center rounded-2xl border border-border bg-surface text-muted-foreground transition-all duration-200 hover:bg-surface-2 hover:text-foreground md:hidden"
            >
              <Menu className="size-4" />
            </button>
            <div onMouseEnter={() => handleLogoHover(true)} className="hidden md:block">
              <button
                type="button"
                onClick={() => setSidebarOpen((current) => !current)}
                className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-foreground transition-all duration-200 ${
                  sidebarOpen
                    ? "border-violet/30 bg-surface-2 ring-1 ring-violet/30"
                    : "border-border bg-surface hover:bg-surface-2"
                }`}
                aria-label="Abrir drawer de chats"
              >
                <Menu className="size-4 text-muted-foreground" />
                <span className="text-lg font-extrabold tracking-tight">BIDO</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden max-w-[260px] items-center rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground/82 lg:flex">
              <span className="truncate">{thread?.title || "Campanha atual"}</span>
            </div>
            <button
              type="button"
              onClick={() => setAnalyticsOpen((current) => !current)}
              className={`hidden h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all duration-200 lg:inline-flex ${analyticsOpen
                ? "border-violet/30 bg-violet-soft text-foreground"
                : "border-border bg-surface text-foreground/75 hover:bg-surface-2 hover:text-foreground"
                }`}
            >
              <BarChart3 className="size-4" />
              Ver Analytics
            </button>
            <div className="rounded-full border border-border bg-surface px-1 py-1 backdrop-blur-xl">
              <UserPill />
            </div>
          </div>
        </div>
      </header>

      {mobileSidebarOpen ? (
        <button
          type="button"
          aria-label="Fechar sidebar"
          onClick={() => setMobileSidebarOpen(false)}
          className="absolute inset-0 z-10 bg-black/30 backdrop-blur-[1px] md:hidden"
        />
      ) : null}

      <BidoChatSidebar
        threads={orderedThreads}
        currentChatId={chatId}
        isOpen={sidebarOpen || mobileSidebarOpen}
        desktopCollapsed
        onClose={() => {
          setSidebarOpen(false);
          setMobileSidebarOpen(false);
        }}
        onSelectChat={(id) => {
          window.location.href = `/chat/${id}`;
        }}
        onCreateChat={() => {
          window.location.href = "/chat";
        }}
        onGoHome={() => {
          window.location.href = "/";
        }}
      />

      <div
        className="flex min-h-screen pt-[76px]"
        onMouseEnter={handleMainMouseEnter}
        onMouseLeave={handleMainMouseLeave}
      >
        <div className={`hidden transition-all duration-300 md:block ${sidebarOpen ? "w-80" : "w-0"}`} />
        <div
          style={{
            paddingRight: analyticsOpen ? `min(${analyticsWidth}vw, 560px)` : "0px",
          }}
          className="relative z-0 flex min-w-0 flex-1 flex-col transition-[padding] duration-300"
        >
          <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {thread ? (
                thread.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${message.role === "user"
                        ? "bg-violet text-violet-foreground"
                        : "border border-border bg-surface text-foreground"
                        }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              ) : (
                <div className="pt-16 text-center text-muted-foreground">Chat não encontrado.</div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-border bg-surface/80 px-4 py-4 backdrop-blur-xl sm:px-6">
            <BidoMessageInput onSend={sendMessage} />
          </div>
        </div>

        <AnalyticsArtifactPanel
          open={analyticsOpen}
          thread={thread}
          widthPercent={analyticsWidth}
          onWidthChange={setAnalyticsWidth}
          onClose={() => setAnalyticsOpen(false)}
        />
      </div>
    </main>
  );
}

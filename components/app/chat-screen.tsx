"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPill } from "@privy-io/react-auth/ui";
import {
  Menu,
  MessageSquare,
} from "lucide-react";
import {
  addThread,
  createEmptyThread,
  loadThreads,
  type ChatThread,
} from "@/lib/chat-store";
import { BidoChatSidebar } from "@/components/app/bido-chat-sidebar";
import { BidoMessageInput } from "@/components/app/bido-message-input";

function ChatHeader({
  sidebarOpen,
  onDesktopToggle,
  onMobileToggle,
}: {
  sidebarOpen: boolean;
  onDesktopToggle: () => void;
  onMobileToggle: () => void;
}) {
  return (
    <header className="absolute inset-x-0 top-0 z-30 border-b border-white/6">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMobileToggle}
            className="inline-flex size-10 items-center justify-center rounded-2xl border border-border bg-surface text-muted-foreground transition-all duration-200 hover:bg-surface-2 hover:text-foreground md:hidden"
          >
            <Menu className="size-4" />
          </button>
          <button
            type="button"
            onClick={onDesktopToggle}
            className={`hidden items-center gap-2 rounded-2xl border px-3 py-2 text-foreground transition-all duration-200 md:inline-flex ${
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

        <div className="flex items-center gap-2">
          <div className="rounded-full border border-border bg-surface px-1 py-1 backdrop-blur-xl">
            <UserPill />
          </div>
        </div>
      </div>
    </header>
  );
}

export function ChatScreen() {
  const router = useRouter();
  const [threads, setThreads] = useState<ChatThread[]>(() => loadThreads());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threads]);

  const createChat = () => {
    const thread = createEmptyThread();
    const next = addThread(thread);
    setThreads(next);
    router.push(`/chat/${thread.id}`);
    setSidebarOpen(false);
    setMobileSidebarOpen(false);
  };

  const sendMessage = (message: string) => {
    const thread = createEmptyThread(message);
    const next = addThread(thread);
    setThreads(next);
    router.push(`/chat/${thread.id}`);
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background">
      <ChatHeader
        sidebarOpen={sidebarOpen}
        onDesktopToggle={() => setSidebarOpen((current) => !current)}
        onMobileToggle={() => setMobileSidebarOpen((current) => !current)}
      />

      <BidoChatSidebar
        threads={threads}
        currentChatId={null}
        isOpen={sidebarOpen || mobileSidebarOpen}
        desktopCollapsed
        onClose={() => {
          setSidebarOpen(false);
          setMobileSidebarOpen(false);
        }}
        onSelectChat={(id) => router.push(`/chat/${id}`)}
        onCreateChat={createChat}
        onGoHome={() => router.push("/")}
      />

      <div className="flex min-h-screen pt-[76px]">
        <div
          className="hidden w-72 md:block"
          onMouseEnter={() => setSidebarOpen(true)}
          onMouseLeave={() => setSidebarOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              <div className="flex flex-1 flex-col items-center justify-center pt-16 text-center">
                <div className="flex size-14 items-center justify-center rounded-3xl border border-border bg-surface text-violet">
                  <MessageSquare className="size-6" />
                </div>
                <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                  Novo chat Bido
                </h1>
                <p className="mt-3 max-w-xl text-muted-foreground">
                  Crie uma conversa nova ou envie uma mensagem para começar a estruturar uma campanha.
                </p>
              </div>
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-border bg-surface/80 px-4 py-4 backdrop-blur-xl sm:px-6">
            <BidoMessageInput onSend={sendMessage} />
          </div>
        </div>
      </div>
    </main>
  );
}

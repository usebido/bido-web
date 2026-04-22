"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Command, CornerDownLeft, House, MessageSquare, Plus, Search, X } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import type { ChatThread } from "@/lib/chat-store";
import { cn } from "@/lib/utils";

function getCampaignName(thread: ChatThread, fallback: string) {
  return thread.title?.trim() || fallback;
}

export function BidoChatSearchModal({
  isOpen,
  threads,
  onClose,
  onSelectChat,
  onCreateChat,
  onGoHome,
}: {
  isOpen: boolean;
  threads: ChatThread[];
  onClose: () => void;
  onSelectChat: (id: string) => void;
  onCreateChat: () => void;
  onGoHome?: () => void;
}) {
  const { messages, formatDate } = useI18n();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions = useMemo(
    () =>
      [
        onGoHome
          ? { key: "home", label: messages.app.sidebar.goHome, icon: House, action: onGoHome }
          : null,
        { key: "new-chat", label: messages.app.sidebar.newChat, icon: Plus, action: onCreateChat },
        { key: "all-chats", label: messages.app.sidebar.openChats, icon: MessageSquare, action: () => onClose() },
      ].filter(Boolean) as {
        key: string;
        label: string;
        icon: typeof House;
        action: () => void;
      }[],
    [messages.app.sidebar.goHome, messages.app.sidebar.newChat, messages.app.sidebar.openChats, onClose, onCreateChat, onGoHome],
  );

  const filteredActions = actions.filter((action) =>
    searchTerm.length === 0 ? true : action.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredThreads = threads.filter((thread) =>
    searchTerm.length === 0
      ? true
      : getCampaignName(thread, messages.app.fallbackNewCampaign)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
  );

  const items = useMemo(
    () => [
      ...filteredActions.map((action) => ({ type: "action" as const, key: action.key, action })),
      ...filteredThreads.map((thread) => ({ type: "thread" as const, key: thread.id, thread })),
    ],
    [filteredActions, filteredThreads],
  );

  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => inputRef.current?.focus(), 40);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((current) => Math.min(current + 1, Math.max(items.length - 1, 0)));
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((current) => Math.max(current - 1, 0));
      }

      if (event.key === "Enter") {
        const selected = items[selectedIndex];
        if (!selected) return;

        if (selected.type === "action") {
          selected.action.action();
        } else {
          onSelectChat(selected.thread.id);
        }
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, items, onClose, onSelectChat, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-24">
      <button
        type="button"
        aria-label={messages.common.close}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <div className="relative z-10 flex max-h-[72vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-white/8 bg-surface/96 shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-violet/10 backdrop-blur-2xl">
        <div className="flex items-center gap-3 border-b border-white/6 px-4 py-3">
          <Search className="size-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setSelectedIndex(0);
            }}
            placeholder={`${messages.app.sidebar.searchChats}...`}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <div className="hidden items-center gap-1 rounded-full border border-white/6 bg-background/40 px-2 py-1 text-[11px] text-muted-foreground sm:flex">
            <Command className="size-3" />
            <span>K</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {filteredActions.length > 0 ? (
            <div>
              <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {messages.app.sidebar.actions}
              </p>
              <div className="space-y-1">
                {filteredActions.map((action, index) => {
                  const Icon = action.icon;
                  const selected = selectedIndex === index;

                  return (
                    <button
                      key={action.key}
                      type="button"
                      onClick={() => {
                        action.action();
                        onClose();
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200",
                        selected ? "bg-violet-soft/35 text-foreground" : "hover:bg-background/55 text-foreground/82",
                      )}
                    >
                      <div className="flex size-9 items-center justify-center rounded-2xl bg-surface-2 text-muted-foreground">
                        <Icon className="size-4" />
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className={filteredActions.length > 0 ? "mt-5" : ""}>
            <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {messages.app.sidebar.campaigns}
            </p>

            {filteredThreads.length > 0 ? (
              <div className="space-y-1">
                {filteredThreads.map((thread, index) => {
                  const globalIndex = index + filteredActions.length;
                  const selected = selectedIndex === globalIndex;

                  return (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => {
                        onSelectChat(thread.id);
                        onClose();
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200",
                        selected ? "bg-violet-soft/35 text-foreground" : "hover:bg-background/55 text-foreground/82",
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {getCampaignName(thread, messages.app.fallbackNewCampaign)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(thread.updatedAt)}
                        </p>
                      </div>
                      <CornerDownLeft className="size-4 shrink-0 text-muted-foreground/70" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/6 bg-background/40 px-4 py-8 text-center text-sm text-muted-foreground">
                {messages.app.sidebar.noCampaigns}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

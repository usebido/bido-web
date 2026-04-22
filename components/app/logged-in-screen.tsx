"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { UserPill } from "@privy-io/react-auth/ui";
import {
  Menu,
} from "lucide-react";
import { addThread, createEmptyThread, loadThreads, type ChatThread } from "@/lib/chat-store";
import { BidoChatSidebar } from "@/components/app/bido-chat-sidebar";
import { BidoMessageInput } from "@/components/app/bido-message-input";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21.805 12.23c0-.79-.064-1.367-.201-1.965H12.2v3.711h5.518c-.111.922-.709 2.31-2.037 3.243l-.019.124 3.027 2.297.21.021c1.929-1.742 3.006-4.305 3.006-7.431Z"
        fill="#4285F4"
      />
      <path
        d="M12.2 21.75c2.704 0 4.973-.87 6.631-2.365l-3.218-2.442c-.861.589-2.016 1.003-3.413 1.003-2.648 0-4.896-1.742-5.698-4.152l-.12.01-3.147 2.386-.041.112C4.843 19.535 8.243 21.75 12.2 21.75Z"
        fill="#34A853"
      />
      <path
        d="M6.502 13.794A5.583 5.583 0 0 1 6.166 12c0-.623.12-1.225.318-1.794l-.006-.12-3.186-2.424-.104.048A9.57 9.57 0 0 0 2.1 12c0 1.562.382 3.037 1.088 4.29l3.314-2.496Z"
        fill="#FBBC05"
      />
      <path
        d="M12.2 6.054c1.761 0 2.945.747 3.618 1.372l2.641-2.53C17.166 3.71 14.904 3 12.2 3 8.243 3 4.843 5.215 3.188 8.445l3.296 2.495c.821-2.41 3.069-4.886 5.716-4.886Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppNavbar({
  sidebarOpen,
  onLogoHover,
  onLogoClick,
  onMobileToggle,
}: {
  sidebarOpen: boolean;
  onLogoHover: (isHovering: boolean) => void;
  onLogoClick: () => void;
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

          <div
            onMouseEnter={() => onLogoHover(true)}
            className="hidden md:block"
          >
            <button
              type="button"
              onClick={onLogoClick}
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
          <div className="rounded-full border border-border bg-surface px-1 py-1 backdrop-blur-xl">
            <UserPill />
          </div>
        </div>
      </div>
    </header>
  );
}

function RayBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 h-full w-full select-none overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div
        className="absolute left-1/2 h-[1800px] w-[4000px] -translate-x-1/2 sm:w-[6000px]"
        style={{
          background:
            "radial-gradient(circle at center 800px, rgba(179, 112, 255, 0.42) 0%, rgba(179, 112, 255, 0.18) 14%, rgba(179, 112, 255, 0.1) 18%, rgba(179, 112, 255, 0.04) 22%, rgba(17, 17, 20, 0.2) 25%)",
        }}
      />
      <div
        className="absolute top-[175px] left-1/2 h-[1600px] w-[1600px] sm:top-1/2 sm:h-[2865px] sm:w-[3043px]"
        style={{ transform: "translate(-50%) rotate(180deg)" }}
      >
        <div
          className="absolute -mt-[13px] h-full w-full rounded-full"
          style={{
            background:
              "radial-gradient(43.89% 25.74% at 50.02% 97.24%, oklch(0.13 0.005 270) 0%, oklch(0 0 0) 100%)",
            border: "16px solid rgba(255,255,255,0.7)",
            transform: "rotate(180deg)",
            zIndex: 5,
          }}
        />
        <div
          className="absolute -mt-[11px] h-full w-full rounded-full bg-background"
          style={{ border: "23px solid rgba(214, 182, 255, 0.35)", transform: "rotate(180deg)", zIndex: 4 }}
        />
        <div
          className="absolute -mt-[8px] h-full w-full rounded-full bg-background"
          style={{ border: "23px solid rgba(196, 145, 255, 0.35)", transform: "rotate(180deg)", zIndex: 3 }}
        />
        <div
          className="absolute -mt-[4px] h-full w-full rounded-full bg-background"
          style={{ border: "23px solid rgba(179, 112, 255, 0.4)", transform: "rotate(180deg)", zIndex: 2 }}
        />
        <div
          className="absolute h-full w-full rounded-full bg-background"
          style={{
            border: "20px solid rgba(179, 112, 255, 0.75)",
            boxShadow: "0 -15px 24.8px rgba(179, 112, 255, 0.35)",
            transform: "rotate(180deg)",
            zIndex: 1,
          }}
        />
      </div>
    </div>
  );
}

function ImportButtons() {
  return (
    <div className="flex items-center justify-center gap-4">
      <span className="text-sm text-muted-foreground">ou importe de</span>
      <div className="flex gap-2">
        {[
          { id: "google", name: "Google Ads", icon: <GoogleIcon className="size-4" /> },
        ].map((option) => (
          <button
            key={option.id}
            type="button"
            className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground/55 transition-all duration-200 hover:bg-surface-2 hover:text-foreground active:scale-95"
          >
            {option.icon}
            <span>{option.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function LoggedInScreen() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [threads, setThreads] = useState<ChatThread[]>(() =>
    loadThreads().sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
  );
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleCreateChat = (message?: string) => {
    const thread = createEmptyThread(message);
    const next = addThread(thread).sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    setThreads(next);
    setSidebarOpen(false);
    setMobileSidebarOpen(false);
    router.push(`/chat/${thread.id}`);
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      <RayBackground />
      <AppNavbar
        sidebarOpen={sidebarOpen}
        onLogoHover={handleLogoHover}
        onLogoClick={() => setSidebarOpen((current) => !current)}
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
        onCreateChat={() => handleCreateChat()}
        onGoHome={() => router.push("/")}
      />

      <div
        onMouseEnter={handleMainMouseEnter}
        onMouseLeave={handleMainMouseLeave}
        className={`absolute top-[64%] left-1/2 z-10 flex h-full w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center overflow-hidden px-4 transition-all duration-300 sm:top-1/2 ${sidebarOpen ? "md:pl-72" : ""
          }`}
      >
        <div className="mb-6 text-center">
          <h1 className="mb-1 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            O que vamos{" "}
            <span className="bg-gradient-to-b from-violet via-violet to-white bg-clip-text italic text-transparent">
              patrocinar
            </span>{" "}
            hoje?
          </h1>
          <p className="text-base font-semibold text-muted-foreground sm:text-lg">
            Crie campanhas, fluxos e experiências do Bido dentro do aplicativo.
          </p>
        </div>

        <div className="mt-2 mb-6 w-full max-w-[700px] sm:mb-8">
          <BidoMessageInput
            placeholder="Descreva o que você quer criar no aplicativo..."
            onSend={(message) => handleCreateChat(message)}
          />
        </div>

        <ImportButtons />
      </div>
    </main>
  );
}

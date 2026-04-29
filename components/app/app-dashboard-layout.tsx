"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserPill } from "@privy-io/react-auth/ui";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useRef, useState } from "react";
import { BarChart3, Menu, Plus, Target } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

export function AppDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { ready, authenticated, login } = usePrivy();
  const { messages } = useI18n();
  const loginEnabled = process.env.NEXT_PUBLIC_LOGIN_ENABLED === "true";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div className="rounded-2xl border border-border bg-surface-2 px-6 py-5 text-sm text-muted-foreground">
          {messages.common.loadingApp}
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-xl rounded-[32px] border border-border bg-surface-2 px-8 py-10 text-center shadow-2xl shadow-black/60">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet">
            {messages.common.appName}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground">
            {messages.app.accessTitle}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {messages.app.accessDescription}
          </p>
          <button
            type="button"
            onClick={loginEnabled ? login : undefined}
            disabled={!loginEnabled}
            className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-violet px-6 text-sm font-semibold text-violet-foreground transition-colors hover:bg-violet/90 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {messages.navbar.signIn}
          </button>
        </div>
      </main>
    );
  }

  const tabs = [
    { href: "/app", label: "Visão geral", icon: BarChart3 },
    { href: "/app/campaigns", label: "Campanhas", icon: Target },
  ];

  const handleSidebarHover = (isHovering: boolean) => {
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
    <main className="min-h-screen bg-background text-foreground">
      <header className="absolute inset-x-0 top-0 z-30 border-b border-white/6">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen((current) => !current)}
              className="inline-flex size-10 items-center justify-center rounded-2xl border border-border bg-surface text-muted-foreground md:hidden"
            >
              <Menu className="size-4" />
            </button>

            <div onMouseEnter={() => handleSidebarHover(true)} className="hidden md:block">
              <button
                type="button"
                onClick={() => setSidebarOpen((current) => !current)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-foreground transition-all duration-200",
                  sidebarOpen
                    ? "border-violet/30 bg-surface-2 ring-1 ring-violet/30"
                    : "border-border bg-surface hover:bg-surface-2",
                )}
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

      {mobileSidebarOpen ? (
        <button
          type="button"
          aria-label={messages.common.closeSidebar}
          onClick={() => setMobileSidebarOpen(false)}
          className="absolute inset-0 z-10 bg-black/20 backdrop-blur-[1px] md:hidden"
        />
      ) : null}

      <aside
        className={cn(
          "absolute top-[76px] bottom-0 left-0 z-20 overflow-hidden transition-all duration-300 ease-in-out",
          sidebarOpen || mobileSidebarOpen
            ? "w-[86vw] max-w-80 translate-x-0 opacity-100"
            : "pointer-events-none w-0 -translate-x-full opacity-0",
        )}
        onMouseEnter={() => handleSidebarHover(true)}
        onMouseLeave={() => {
          setSidebarOpen(false);
          setMobileSidebarOpen(false);
        }}
      >
        <div className="h-full w-[86vw] max-w-80 p-3 md:w-80">
          <div className="flex h-full flex-col overflow-hidden rounded-[28px] bg-surface/88 shadow-[0_18px_60px_rgba(0,0,0,0.35)] ring-1 ring-white/6 backdrop-blur-2xl">
            <div className="px-4 pt-4 pb-3">
              <Link
                href="/"
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/6 bg-background/45 px-4 py-2.5 text-sm font-medium text-foreground/82 transition-all duration-200 hover:bg-background/70 hover:text-foreground"
                onClick={() => {
                  setSidebarOpen(false);
                  setMobileSidebarOpen(false);
                }}
              >
                Retornar Home
              </Link>
              <Link
                href="/app/campaigns/new"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet px-4 py-3 text-sm font-semibold text-violet-foreground transition-all duration-200 hover:bg-violet/90"
                onClick={() => {
                  setSidebarOpen(false);
                  setMobileSidebarOpen(false);
                }}
              >
                <Plus className="size-4" />
                Nova campanha
              </Link>
            </div>

            <div className="min-h-0 flex-1 px-3 pb-4">
              <div className="px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Navegação
              </div>
              <div className="space-y-1 overflow-y-auto pr-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = tab.href === "/app" ? pathname === "/app" : pathname.startsWith(tab.href);

                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200",
                        active
                          ? "bg-violet-soft/35 text-foreground shadow-[inset_0_0_0_1px_rgba(179,112,255,0.22)]"
                          : "bg-transparent text-foreground/80 hover:bg-background/55",
                      )}
                      onClick={() => {
                        setSidebarOpen(false);
                        setMobileSidebarOpen(false);
                      }}
                    >
                      <Icon className="size-4" />
                      <span className="text-sm">{tab.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div
        className={cn(
          "mx-auto max-w-7xl px-6 pt-28 pb-8 transition-all duration-300",
          sidebarOpen ? "md:pl-72" : "",
        )}
        onMouseEnter={handleMainMouseEnter}
        onMouseLeave={handleMainMouseLeave}
      >
        {children}
      </div>
    </main>
  );
}

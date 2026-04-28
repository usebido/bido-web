"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { UserPill } from "@privy-io/react-auth/ui";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { UseCasesMegaMenu } from "@/components/site/use-cases-mega-menu";
import { cn } from "@/lib/utils";

export function Navbar({
  authenticated,
  onLogin,
}: {
  authenticated: boolean;
  onLogin: () => void;
}) {
  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const loginEnabled = process.env.NEXT_PUBLIC_LOGIN_ENABLED === "true";
  const { locale, setLocale, localeLabels, messages } = useI18n();

  const menuItems = [
    { name: messages.navbar.adsForAgents, href: "/sponsors" },
    { name: messages.navbar.forDevs, href: "/devs" },
    { name: messages.navbar.useCases, href: "#" },
    { name: messages.navbar.docs, href: "#" },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openMegaMenu = (item: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(item);
  };

  const scheduleCloseMegaMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };

  return (
    <header className="fixed top-0 z-50 w-full">
      <nav data-state={menuState ? "active" : undefined} className="w-full px-4 pt-3">
        <div
          className={cn(
            "mx-auto max-w-7xl rounded-full border transition-[background-color,border-color,box-shadow] duration-500 ease-out",
            isScrolled
              ? "border-border/80 bg-background/88 shadow-[0_12px_40px_rgba(88,28,135,0.08)] backdrop-blur-xl dark:border-white/8 dark:bg-background/80 dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
              : "border-transparent bg-transparent shadow-none",
          )}
        >
          <div className="flex h-16 items-center gap-6 px-6">
            {pathname === "/" ? (
              <a href="#top" aria-label={messages.common.home} className="flex shrink-0 items-center text-foreground">
                <span className="text-lg font-extrabold tracking-tight">BIDO</span>
              </a>
            ) : (
              <Link href="/" aria-label={messages.common.home} className="flex shrink-0 items-center text-foreground">
                <span className="text-lg font-extrabold tracking-tight">BIDO</span>
              </Link>
            )}

            <button
              onClick={() => setMenuState((current) => !current)}
              aria-label={menuState ? messages.navbar.closeMenu : messages.navbar.openMenu}
              className="relative z-20 ml-auto block cursor-pointer p-2.5 lg:hidden"
            >
              {menuState ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>

            <nav className="hidden flex-1 justify-center lg:flex">
              <ul className="flex items-center gap-1">
                {menuItems.map((item) => {
                  const hasMenu = item.name === messages.navbar.useCases;

                  return (
                    <li
                      key={item.name}
                      className="relative"
                      onMouseEnter={() => hasMenu && openMegaMenu(item.name)}
                      onMouseLeave={() => hasMenu && scheduleCloseMegaMenu()}
                    >
                      {hasMenu ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                        >
                          {item.name}
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                        >
                          {item.name}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="hidden shrink-0 items-center gap-2 lg:flex">
              <div className="inline-flex items-center rounded-full border border-border bg-surface/70 p-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {(["pt-BR", "en"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLocale(value)}
                    className={cn(
                      "rounded-full px-3 py-1 transition-colors",
                      locale === value ? "bg-foreground text-background" : "hover:text-foreground",
                    )}
                    aria-label={`${messages.common.language}: ${localeLabels[value]}`}
                  >
                    {localeLabels[value]}
                  </button>
                ))}
              </div>
              {authenticated ? (
                <>
                  <UserPill />
                  <Link
                    href="/app"
                    className="inline-flex h-9 items-center justify-center rounded-full bg-foreground px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-background transition-colors hover:bg-foreground/90"
                  >
                    {messages.navbar.launchApp}
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  onClick={loginEnabled ? onLogin : undefined}
                  disabled={!loginEnabled}
                  className="inline-flex h-9 items-center justify-center rounded-full bg-foreground px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {messages.navbar.signIn}
                </button>
              )}
            </div>
        </div>

        <div
          className={`hidden lg:block ${openMenu === messages.navbar.useCases ? "pointer-events-auto" : "pointer-events-none"}`}
          onMouseEnter={() => openMegaMenu(messages.navbar.useCases)}
          onMouseLeave={scheduleCloseMegaMenu}
        >
          <div
            className={cn(
              "absolute left-0 right-0 top-full pt-3 transition-all duration-200",
              openMenu === messages.navbar.useCases
                ? "translate-y-0 opacity-100"
                : "-translate-y-2 opacity-0",
            )}
          >
            <div className="mx-auto max-w-[1100px] px-6">
              <div className="overflow-hidden rounded-3xl border border-border bg-background/96 shadow-2xl backdrop-blur-xl">
                <UseCasesMegaMenu />
              </div>
            </div>
          </div>
        </div>

          {menuState && (
            <div className="rounded-2xl border-t border-border bg-background/95 p-6 lg:hidden">
              <ul className="space-y-4">
                <li>
                  <div className="inline-flex items-center rounded-full border border-border bg-surface/70 p-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {(["pt-BR", "en"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setLocale(value)}
                        className={cn(
                          "rounded-full px-3 py-1 transition-colors",
                          locale === value ? "bg-foreground text-background" : "hover:text-foreground",
                        )}
                      >
                        {localeLabels[value]}
                      </button>
                    ))}
                  </div>
                </li>
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="block text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-2">
                {authenticated ? (
                  <>
                    <div className="rounded-full border border-border bg-surface px-1 py-1">
                      <UserPill expanded />
                    </div>
                    <Link
                      href="/app"
                      className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-4 text-xs font-bold uppercase tracking-[0.14em] text-background"
                    >
                      {messages.navbar.launchApp}
                    </Link>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={loginEnabled ? onLogin : undefined}
                    disabled={!loginEnabled}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-4 text-xs font-bold uppercase tracking-[0.14em] text-background disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {messages.navbar.signIn}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

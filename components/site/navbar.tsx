"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserPill } from "@privy-io/react-auth/ui";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Ads para Agents", href: "/build" },
  { name: "Use Cases", href: "#" },
  { name: "Documentação", href: "#" },
  { name: "Sobre nós", href: "#" },
];

function GhostLogo() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M16 3C9.925 3 5 7.925 5 14v13.5c0 1.1 1.317 1.667 2.117.91L10 25.5l2.883 2.91a1.5 1.5 0 0 0 2.134 0L18 25.5l2.883 2.91a1.5 1.5 0 0 0 2.134 0L26 25.5l1.883 1.91c.8.757 2.117.19 2.117-.91V14C30 7.925 25.075 3 19 3h-3Z"
        fill="currentColor"
      />
      <circle cx="13" cy="14" r="1.6" fill="#000" />
      <circle cx="20" cy="14" r="1.6" fill="#000" />
    </svg>
  );
}

export function Navbar({
  authenticated,
  onLogin,
}: {
  authenticated: boolean;
  onLogin: () => void;
}) {
  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 z-50 w-full">
      <nav data-state={menuState ? "active" : undefined} className="w-full px-4 pt-3">
        <div
          className={cn(
            "mx-auto max-w-7xl rounded-full border transition-[background-color,border-color,box-shadow] duration-500 ease-out",
            isScrolled
              ? "border-border/70 bg-background/70 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl"
              : "border-transparent bg-transparent shadow-none",
          )}
        >
          <div className="flex h-16 items-center gap-6 px-6">
            <Link href="/" aria-label="home" className="flex shrink-0 items-center gap-2 text-foreground">
              <GhostLogo />
              <span className="text-lg font-extrabold tracking-tight">BIDO</span>
            </Link>

            <button
              onClick={() => setMenuState((current) => !current)}
              aria-label={menuState ? "Close Menu" : "Open Menu"}
              className="relative z-20 ml-auto block cursor-pointer p-2.5 lg:hidden"
            >
              {menuState ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>

            <nav className="hidden flex-1 justify-center lg:flex">
              <ul className="flex items-center gap-1">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="hidden shrink-0 items-center gap-2 lg:flex">
              {authenticated ? (
                <>
                  <UserPill />
                  <Link
                    href="/app"
                    className="inline-flex h-9 items-center justify-center rounded-full bg-foreground px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-background transition-colors hover:bg-foreground/90"
                  >
                    Iniciar aplicativo
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onLogin}
                  className="inline-flex h-9 items-center justify-center rounded-full bg-foreground px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-background transition-colors hover:bg-foreground/90"
                >
                  Entrar
                </button>
              )}
            </div>
          </div>

          {menuState && (
            <div className="rounded-2xl border-t border-border bg-background/95 p-6 lg:hidden">
              <ul className="space-y-4">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="block text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                    >
                      {item.name}
                    </a>
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
                      Iniciar aplicativo
                    </Link>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={onLogin}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-4 text-xs font-bold uppercase tracking-[0.14em] text-background"
                  >
                    Entrar
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

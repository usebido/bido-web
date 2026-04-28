"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-0.5 rounded-full border border-border bg-surface p-1 dark:bg-surface-2">
      <SwitchButton
        selected={theme === "light"}
        label="Light theme"
        onClick={() => setTheme("light")}
      >
        <Sun className="size-4" strokeWidth={2} />
      </SwitchButton>
      <SwitchButton
        selected={theme === "system"}
        label="System theme"
        onClick={() => setTheme("system")}
      >
        <Monitor className="size-4" strokeWidth={2} />
      </SwitchButton>
      <SwitchButton
        selected={theme === "dark"}
        label="Dark theme"
        onClick={() => setTheme("dark")}
      >
        <Moon className="size-4" strokeWidth={2} />
      </SwitchButton>
    </div>
  );
}

function SwitchButton({
  selected,
  label,
  onClick,
  children,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      data-selected={selected}
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded-full p-[3px] text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground data-[selected=true]:bg-violet data-[selected=true]:text-white dark:hover:bg-background/40"
    >
      {children}
    </button>
  );
}

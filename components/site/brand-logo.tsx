import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/logo-dark.png"
        alt="Bido"
        width={640}
        height={180}
        sizes="(max-width: 768px) 88px, 118px"
        priority={priority}
        className="h-auto w-full dark:hidden"
      />
      <Image
        src="/logo-white.png"
        alt="Bido"
        width={640}
        height={180}
        sizes="(max-width: 768px) 88px, 118px"
        priority={priority}
        className="hidden h-auto w-full dark:block"
      />
    </span>
  );
}

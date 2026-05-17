"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  
  if (pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <footer className="py-8 text-center text-sm text-foreground/60 border-t border-black/5 dark:border-white/5 mt-auto">
      <p>
        Dibuat dengan ❤️ untuk JuaraVibeCoding by Google for Developers 2026
      </p>
    </footer>
  );
}

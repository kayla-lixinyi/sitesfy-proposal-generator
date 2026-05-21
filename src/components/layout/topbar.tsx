"use client";

import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Topbar() {
  return (
    <header className="flex h-14 items-center justify-end border-b bg-background px-6">
      <ThemeToggle />
    </header>
  );
}

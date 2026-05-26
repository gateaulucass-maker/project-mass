"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            color: "hsl(var(--foreground))",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "500",
          },
          classNames: {
            toast: "shadow-lg",
          },
        }}
        richColors
      />
    </ThemeProvider>
  );
}

import { Read the file content first. Since this is a new file, I'll write the root layout with authentication check and theme provider.
 } from "react";
import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthCheck } from "@/components/auth-check";

export const metadata: Metadata = {
  title: "Task Manager",
  description: "Manage your tasks efficiently",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthCheck>{children}</AuthCheck>
        </ThemeProvider>
      </body>
    </html>
  );
}

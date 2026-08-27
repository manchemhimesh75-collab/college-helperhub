import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Sign in or create an account to access College Academic Hub",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b px-4 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="College Academic Hub Home">
            <GraduationCap className="h-8 w-8 text-primary" aria-hidden="true" />
            <span className="text-xl font-bold text-foreground">Academic Hub</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="border-t px-4 py-6">
        <div className="mx-auto max-w-7xl text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} College Academic Hub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
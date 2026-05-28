import Link from "next/link";
import type { ReactNode } from "react";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 lg:px-10 lg:py-24">
      <Link
        href="/"
        className="text-xs uppercase tracking-[0.25em] text-cyan-muted transition hover:text-cyan"
      >
        ← Back to home
      </Link>
      <h1 className="mt-8 font-serif text-4xl text-white md:text-5xl">
        {title}
      </h1>
      <p className="mt-4 text-sm text-cyan-muted">Last updated: {updated}</p>
      <div className="prose-legal mt-10 space-y-6 text-sm leading-7 text-white/75">
        {children}
      </div>
    </article>
  );
}

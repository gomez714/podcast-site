"use client";

import "./globals.css";

/** Replaces the root layout when it fails, so it can't rely on the site header, footer or fonts. */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center surface-dark px-6 font-sans">
        <main className="mx-auto max-w-xl py-16">
          <p className="eyebrow text-ice">The Bottom Left Pane</p>
          <h1 className="my-6 display-lg">Something went wrong.</h1>
          <p className="mb-8 text-pale">Please try again in a moment.</p>
          <button
            type="button"
            onClick={() => retry()}
            className="min-h-12 rounded-md bg-pale px-6 text-sm font-extrabold text-navy"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

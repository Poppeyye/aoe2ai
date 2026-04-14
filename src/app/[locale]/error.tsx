"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const locale = pathname?.split("/").filter(Boolean)[0] ?? "en";
  const homeHref = `/${locale}`;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 bg-aoe-dark/40">
      <div className="card max-w-md w-full border border-aoe-border bg-aoe-card text-center">
        <div className="mb-4 flex justify-center text-aoe-accent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-14 w-14"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-medieval font-bold gold-gradient mb-2">
          {locale === "es" ? "Algo salió mal" : "Something went wrong"}
        </h1>
        <p className="text-sm text-gray-500 mb-6 break-words">
          {error.message || (locale === "es" ? "Ha ocurrido un error inesperado." : "An unexpected error occurred.")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button type="button" onClick={() => reset()} className="btn-primary">
            {locale === "es" ? "Reintentar" : "Try again"}
          </button>
          <Link href={homeHref} className="btn-secondary text-center">
            {locale === "es" ? "Ir al inicio" : "Go home"}
          </Link>
        </div>
      </div>
    </div>
  );
}

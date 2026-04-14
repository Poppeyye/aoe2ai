import Link from "next/link";
import { Swords } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="card max-w-md w-full text-center">
        <Swords className="w-14 h-14 text-aoe-accent mx-auto mb-4 opacity-60" />
        <h1 className="text-4xl font-medieval font-bold gold-gradient mb-2">404</h1>
        <p className="text-gray-400 mb-6">
          This page could not be found. The villagers searched everywhere.
        </p>
        <Link href="/en" className="btn-primary">
          Go home
        </Link>
      </div>
    </div>
  );
}

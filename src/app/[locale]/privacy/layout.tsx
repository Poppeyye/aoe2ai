import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return buildPageMetadata(params.locale, "privacy", "privacy");
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

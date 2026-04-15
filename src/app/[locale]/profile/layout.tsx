import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildPageMetadata(locale, "profile", "profile");
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}

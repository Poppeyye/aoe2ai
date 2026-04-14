import { Shield } from "lucide-react";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { isValidLocale } from "@/i18n/config";
import { notFound } from "next/navigation";

export default async function PrivacyPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isValidLocale(params.locale)) notFound();
  const dict = await getDictionary(params.locale as Locale);
  const d = dict.privacy;

  const sections = [
    { title: d.what_we_collect, text: d.what_we_collect_text },
    { title: d.how_we_use, text: d.how_we_use_text },
    { title: d.cookies, text: d.cookies_text },
    { title: d.data_storage, text: d.data_storage_text },
    { title: d.your_rights, text: d.your_rights_text },
    { title: d.contact, text: d.contact_text },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <Shield className="w-10 h-10 text-aoe-accent mx-auto mb-3" />
        <h1 className="text-3xl font-medieval font-bold gold-gradient mb-2">
          {d.title}
        </h1>
        <p className="text-gray-400">{d.subtitle}</p>
        <p className="text-xs text-gray-600 mt-2">{d.last_updated}</p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="card">
            <h2 className="text-lg font-semibold text-white mb-2">
              {section.title}
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              {section.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

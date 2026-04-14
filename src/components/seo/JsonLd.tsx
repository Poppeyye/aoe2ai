export function WebSiteJsonLd({ locale }: { locale: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AoE2.ai",
    url: `https://aoe2.ai/${locale}`,
    description:
      locale === "es"
        ? "Herramientas de inteligencia artificial para jugadores de Age of Empires II: espía rivales, analiza replays, explora el árbol tecnológico y más."
        : "AI-powered tools for Age of Empires II players: scout opponents, analyze replays, explore the tech tree, and more.",
    inLanguage: locale === "es" ? "es" : "en",
    potentialAction: {
      "@type": "SearchAction",
      target: `https://aoe2.ai/${locale}/players?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebApplicationJsonLd({ locale }: { locale: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "AoE2.ai",
    url: "https://aoe2.ai",
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      locale === "es"
        ? "Portal con IA para la comunidad de Age of Empires II: scouting de rivales, análisis de replays, árbol tecnológico interactivo, torneos y más."
        : "AI-powered portal for the Age of Empires II community: opponent scouting, replay analysis, interactive tech tree, tournaments, and more.",
    featureList: [
      "AI Opponent Scouting",
      "Replay Analysis",
      "Interactive Tech Tree",
      "Player Leaderboards",
      "Tournament Tracker",
      "Build Order Guides",
      "AI Chat Assistant",
    ],
    inLanguage: ["en", "es"],
    author: {
      "@type": "Person",
      name: "popeeeeeeeye",
      url: "https://www.aoe2insights.com/user/12154050/",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-MLVVQJ6GYJ";

export default function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          // Consent Mode v2: denied by default until the user accepts the banner
          var storedConsent = null;
          try { storedConsent = localStorage.getItem('cookie-consent'); } catch (e) {}
          gtag('consent', 'default', {
            analytics_storage: storedConsent === 'granted' ? 'granted' : 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
          });
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}

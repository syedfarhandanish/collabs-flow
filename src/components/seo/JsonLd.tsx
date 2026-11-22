import { FAQ } from "@/lib/faq";
import { ORG_NAME, ORG_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

/** Structured data so search engines understand the page (WebApplication + FAQ + Organization). */
export function JsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#org`,
        name: ORG_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/icons/icon-512.png`,
        sameAs: [ORG_URL],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#org` },
        inLanguage: "en",
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#app`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        applicationCategory: "EducationalApplication",
        applicationSubCategory: "Productivity",
        operatingSystem: "Any (web browser)",
        browserRequirements: "Requires JavaScript. Works in all modern browsers.",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        image: `${SITE_URL}/og.png`,
        screenshot: `${SITE_URL}/og.png`,
        publisher: { "@id": `${SITE_URL}/#org` },
        audience: { "@type": "EducationalAudience", educationalRole: "student" },
        featureList: [
          "Pomodoro timer with custom focus and break lengths",
          "Lofi study music from YouTube",
          "Rain, waves, wind, fireplace, brown and white noise mixer",
          "Study task board with subjects and priorities",
          "Daily goals, streaks, XP levels and achievements",
          "Zen full-screen focus mode",
          "Installable progressive web app that works offline",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: FAQ.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
    />
  );
}

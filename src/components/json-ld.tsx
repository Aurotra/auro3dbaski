import { site } from "@/lib/site";

export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    url: site.url,
    email: site.email,
    image: `${site.url}/brands/mark.svg`,
    description: site.description,
    areaServed: "TR",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Denizli",
      addressCountry: "TR",
    },
    sameAs: [site.instagram],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

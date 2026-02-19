"use client";

import { useTranslation } from "react-i18next";

export function JsonLd() {
  const { i18n } = useTranslation();
  
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Atomecom",
    "url": "https://atomecom.com",
    "logo": "https://atomecom.com/logo.png",
    "description": "Modern E-commerce Solution",
    "sameAs": [
        "https://sanghynh.info.vn",
      "https://github.com/SangHynh",
      "https://linkedin.com/in/sanghynh"
    ]
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Atomecom",
    "url": "https://atomecom.com",
    "inLanguage": i18n.language
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
    </>
  );
}

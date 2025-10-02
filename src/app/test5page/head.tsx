export default function Head() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    url: "https://wisprflow.ai",
    sameAs: [
      "https://x.com/wisprflow",
      "https://www.linkedin.com/company/wisprflow/",
      "https://www.instagram.com/wisprflow.ai/",
      "https://www.youtube.com/@wisprflowai/",
      "https://www.tiktok.com/@wisprflow.ai"
    ],
    logo: "https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/683215c6f233131a07d8bafc_navbar_logo.svg",
    name: "Flow",
    alternateName: "Wispr Flow",
    description:
      "Flow makes writing quick and clear with seamless voice dictation. It is the fastest, smartest way to type with your voice.",
    email: "flow@wispr.ai",
    founder: [
      {
        "@type": "Person",
        name: "Tanay Kothari",
        sameAs: "https://www.linkedin.com/in/tankots/",
        jobTitle: "Co-founder & CEO at Wispr"
      },
      {
        "@type": "Person",
        name: "Sahaj Garg",
        sameAs: "https://www.linkedin.com/in/sahajgarg/",
        jobTitle: "Co-founder & CTO at Wispr"
      }
    ],
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "SOC 2 Type II",
      url: "https://wisprflow.ai/privacy-policy"
    }
  };

  return (
    <>
      <title>Wispr Flow | Effortless Voice Dictation</title>
      <meta
        name="description"
        content="Flow makes writing quick and clear with seamless voice dictation. It is the fastest, smartest way to type with your voice."
      />
      <meta property="og:title" content="Wispr Flow | Effortless Voice Dictation" />
      <meta
        property="og:description"
        content="Flow makes writing quick and clear with seamless voice dictation. It is the fastest, smartest way to type with your voice."
      />
      <meta
        property="og:image"
        content="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/683c611aba65ade013982bcd_wispr-og-min.jpg"
      />
      <meta property="og:type" content="website" />
      <meta property="twitter:title" content="Wispr Flow | Effortless Voice Dictation" />
      <meta
        property="twitter:description"
        content="Flow makes writing quick and clear with seamless voice dictation. It is the fastest, smartest way to type with your voice."
      />
      <meta
        property="twitter:image"
        content="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/683c611aba65ade013982bcd_wispr-og-min.jpg"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="google-site-verification" content="nB5ZhzlaRY-zASqKlMYFlebzNc0mGhssolT9qcS3nms" />
      <meta name="google-site-verification" content="P6GGpe_kog7Zac5lr_zc-Riq4UO4NNedDoVSLBu2-C4" />
      <link rel="canonical" href="https://wisprflow.ai" />
      <link
        rel="stylesheet"
        href="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/css/flowsite-dev.webflow.shared.f6ca91fdb.min.css"
      />
      <link
        rel="shortcut icon"
        href="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/684b3be32acf9b372f54d041_ws-favi.png"
        type="image/x-icon"
      />
      <link
        rel="apple-touch-icon"
        href="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/684b3c2e586614c88aa0afde_ws-wc.png"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
}

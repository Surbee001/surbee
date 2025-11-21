import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'DeepJudge - Precision AI Search for legal teams',
  description:
    'Powered by world-class enterprise search that serves up immediate access to all of the institutional knowledge in your firm, DeepJudge enables you to build entire AI applications, encapsulate multi-step workflows, and implement LLM agents.',
  openGraph: {
    title: 'DeepJudge - Precision AI Search for legal teams',
    description:
      'Powered by world-class enterprise search that serves up immediate access to all of the institutional knowledge in your firm, DeepJudge enables you to build entire AI applications, encapsulate multi-step workflows, and implement LLM agents.',
    images: [
      {
        url: 'https://cdn.prod.website-files.com/67bdd03200678df04ba07593/67d45178862f7a080de6a4d2_Open%20Graph%20Image%20from%20TinyPNG.jpg',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeepJudge - Precision AI Search for legal teams',
    description:
      'Powered by world-class enterprise search that serves up immediate access to all of the institutional knowledge in your firm, DeepJudge enables you to build entire AI applications, encapsulate multi-step workflows, and implement LLM agents.',
    images: [
      'https://cdn.prod.website-files.com/67bdd03200678df04ba07593/67d45178862f7a080de6a4d2_Open%20Graph%20Image%20from%20TinyPNG.jpg',
    ],
  },
  icons: {
    icon: '/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/68010a5ca6760aeae5cf6e74_Profile%20Photo%2001%20-%20Optical%20Adjustmet.png',
    apple:
      '/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/68010a3fcb9742b4b6c2426b_Profile%20Photo%2001%20-%20Optical%20Adjustmet.png',
  },
};

export default function LandNewReactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link
        rel="stylesheet"
        href="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/css/deepjudge-staging.webflow.shared.5147e2e55.min.css"
      />
      <link
        rel="stylesheet"
        href="/landnew/deepjudge-code.netlify.app/style.css"
      />
      <Script id="scroll-restoration" strategy="beforeInteractive">
        {`
          if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
          }
        `}
      </Script>
      {children}
    </>
  );
}

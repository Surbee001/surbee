import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cofounder - Automate your life with AI',
  description: 'Automate your life with natural language, driving the software you are already familiar with.',
};

export default function TestPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="stylesheet" href="/cofounder-styles/main.css" />
      <link rel="stylesheet" href="/cofounder-styles/secondary.css" />
      {children}
    </>
  );
}


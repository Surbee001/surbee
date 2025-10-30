import type { Metadata } from 'next';
import CofounderTerms from '../components/CofounderTerms';

export const metadata: Metadata = {
  title: 'Cofounder Terms of Service',
  description: 'Review the terms governing your use of Cofounder.',
};

export default function TermsOfServicePage() {
  return <CofounderTerms />;
}

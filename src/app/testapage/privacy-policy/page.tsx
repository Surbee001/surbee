import type { Metadata } from 'next';
import CofounderPrivacy from '../components/CofounderPrivacy';

export const metadata: Metadata = {
  title: 'Cofounder Privacy Policy',
  description: 'Read how Cofounder handles your data and respects your privacy.',
};

export default function PrivacyPolicyPage() {
  return <CofounderPrivacy />;
}

import type { Metadata } from 'next';
import CofounderPricing from '../components/CofounderPricing';

export const metadata: Metadata = {
  title: 'Cofounder Pricing',
  description: 'Understand Cofounder plans, pricing, and value at a glance.',
};

export default function PricingPage() {
  return <CofounderPricing />;
}

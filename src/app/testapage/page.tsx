import type { Metadata } from 'next';
import CofounderHome from './components/CofounderHome';

export const metadata: Metadata = {
  title: 'Cofounder – Automate your life with natural language',
  description:
    'Automate your life with natural language. Cofounder plugs into your existing tools, writes automations, and organizes workflows.',
};

export default function TestaPage() {
  return <CofounderHome />;
}

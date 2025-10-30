import SettingsPage2 from '@/components/settings/SettingsPage2';

// Force dynamic rendering to avoid prerender errors with context providers
export const dynamic = 'force-dynamic';

export default function Settings2Page() {
  return <SettingsPage2 />;
}
import SecuritySettings from '@/features/auth/components/security-settings';
import PreferencesForm from '@/features/preferences/components/preferences-form';
import requireUser from '@/lib/auth/session';
export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <div className="max-w-xl">
      <h1 className="mb-3 text-3xl font-semibold">Settings</h1>
      <p className="mb-8 text-text-sub-600">
        Manage your preferences and account security.
      </p>
      <PreferencesForm user={user} />
      <SecuritySettings
        locale={user.locale ?? 'en-US'}
        timezone={user.timezone ?? 'UTC'}
      />
    </div>
  );
}

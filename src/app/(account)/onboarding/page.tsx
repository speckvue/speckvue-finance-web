import PreferencesForm from '@/features/preferences/components/preferences-form';
import requireUser from '@/lib/auth/session';
import { redirect } from 'next/navigation';
export default async function OnboardingPage() {
  const user = await requireUser(false);
  if (user.onboardedAt) redirect('/workspace');
  return (
    <div className="max-w-xl">
      <p className="mb-2 text-sm text-text-sub-600">Welcome to Speckvue</p>
      <h1 className="mb-3 text-3xl font-semibold">Make it yours</h1>
      <p className="mb-8 text-text-sub-600">
        Choose how you want to see your finances. You can change these
        preferences in settings.
      </p>
      <PreferencesForm user={user} onboarding />
    </div>
  );
}

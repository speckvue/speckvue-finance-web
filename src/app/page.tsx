import Brand from '@/components/shared/brand';
import { getUser } from '@/lib/auth/session';
import publicEnv from '@/lib/config/public-env';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const Home = async () => {
  const user = await getUser();
  if (user) redirect(user.onboardedAt ? '/workspace' : '/onboarding');
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between gap-4 border-b border-stroke-soft-200 p-6">
        <Brand />
      </header>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-heading text-3xl font-semibold">
          {publicEnv.NEXT_PUBLIC_APP_NAME}
        </h1>
        <p className="mt-4 text-text-sub-600">
          Your money. Your plans. One clear view.
        </p>
        <div className="mt-8 flex gap-6">
          <Link
            href="/signup"
            className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-medium text-static-white"
          >
            Create account
          </Link>
          <Link
            href="/signin"
            className="px-5 py-3 text-sm text-primary-base underline"
          >
            Signin
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home;

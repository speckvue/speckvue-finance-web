import Brand from '@/components/shared/brand';
import ThemeSwitcher from '@/components/shared/theme-switcher';
import publicEnv from '@/lib/config/public-env';

const Home = () => (
  <div className="min-h-screen">
    <header className="flex items-center justify-between gap-4 border-b border-stroke-soft-200 p-6">
      <Brand />
      <ThemeSwitcher />
    </header>
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-heading text-3xl font-semibold">
        {publicEnv.NEXT_PUBLIC_APP_NAME}
      </h1>
      <p className="mt-4 text-text-sub-600">Application foundation ready.</p>
    </main>
  </div>
);

export default Home;

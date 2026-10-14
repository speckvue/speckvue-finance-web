import Brand from '@/components/shared/brand';
import ThemeSwitcher from '@/components/shared/theme-switcher';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between p-6 sm:px-10">
        <Brand />
        <ThemeSwitcher />
      </header>
      <main className="mx-auto grid min-h-[calc(100vh-100px)] max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-2">
        <div className="hidden rounded-3xl bg-bg-weak-50 p-12 lg:block">
          <p className="text-xs font-medium tracking-widest text-primary-base uppercase">
            Speckvue Finance
          </p>
          <h2 className="mt-7 text-5xl leading-tight font-semibold tracking-tight">
            Make room
            <br />
            for what
            <br />
            matters.
          </h2>
          <p className="mt-6 max-w-sm text-base leading-7 text-text-sub-600">
            Understand your money. Build thoughtful habits. Move forward with
            clarity.
          </p>
          <div className="mt-12 border-t border-stroke-soft-200 pt-6 text-sm text-text-sub-600">
            Personal finance, with perspective.
          </div>
        </div>
        <div className="flex justify-center">{children}</div>
      </main>
    </div>
  );
};

export default AuthLayout;

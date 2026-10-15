import Brand from '@/components/shared/brand';
import BrandSymbol from '@/components/shared/brand-symbol';
import ThemeSwitcher from '@/components/shared/theme-switcher';
import { getUser } from '@/lib/auth/session';
import { RiArrowRightUpLine, RiFingerprintLine } from '@remixicon/react';
import { redirect } from 'next/navigation';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (user) redirect(user.onboardedAt ? '/workspace' : '/onboarding');
  return (
    <div className="auth-shell">
      <div className="auth-window">
        <header className="auth-header">
          <Brand />
          <div className="auth-header-tools">
            <span className="auth-header-label">
              A clearer view of your money
            </span>
            <ThemeSwitcher />
          </div>
        </header>
        <main className="auth-workspace">
          <div className="auth-workspace-heading">
            <div>
              <p>Personal finance, made personal.</p>
              <h2>Your space to start.</h2>
            </div>
            <span className="auth-access-label">
              <RiFingerprintLine size={18} aria-hidden="true" /> Account access
            </span>
          </div>
          <div className="auth-grid">
            <aside className="auth-story" aria-label="Speckvue Finance">
              <div className="auth-story-top">
                <span>Made for your everyday.</span>
                <RiArrowRightUpLine size={24} aria-hidden="true" />
              </div>
              <div className="auth-story-art" aria-hidden="true">
                <BrandSymbol />
              </div>
              <div className="auth-story-copy">
                <h2>
                  A little clarity.
                  <br /> A lot of <br />
                  possibility.
                </h2>
                <p>Make room for the plans that matter to you.</p>
              </div>
              <p className="auth-story-signature">Your money. Your pace.</p>
            </aside>
            <section className="auth-entry" aria-label="Account access">
              <div className="auth-entry-inner">{children}</div>
            </section>
          </div>
          <footer className="auth-workspace-footer">
            <span>Speckvue Finance</span>
            <span>A fresh perspective on personal finance.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

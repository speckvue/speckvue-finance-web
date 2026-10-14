'use client';

import Brand from '@/components/shared/brand';
import ThemeSwitcher from '@/components/shared/theme-switcher';
import * as Button from '@/components/ui/button';
import * as Drawer from '@/components/ui/drawer';
import useShellStore from '@/stores/shell-store';
import {
  RiArrowRightUpLine,
  RiCloseLine,
  RiMenuLine,
  RiShieldCheckLine,
} from '@remixicon/react';
import Link from 'next/link';
import Navigation from './navigation';

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const menuOpen = useShellStore((s) => s.menuOpen);
  const setMenuOpen = useShellStore((s) => s.setMenuOpen);
  return (
    <div className="min-h-screen bg-bg-weak-50 text-text-strong-950">
      <a
        href="#main-content"
        className="sr-only fixed z-50 rounded-lg bg-bg-white-0 p-3 focus:not-sr-only"
      >
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-stroke-soft-200 bg-bg-white-0 p-6 lg:flex">
        <Brand />
        <div className="mt-12">
          <Navigation />
        </div>
        <div className="mt-auto rounded-xl border border-stroke-soft-200 p-4">
          <RiShieldCheckLine
            className="mb-2 size-5 text-primary-base"
            aria-hidden="true"
          />
          <p className="text-sm font-medium">A clear view of your money</p>
          <p className="mt-1 text-xs leading-5 text-text-sub-600">
            Your finance workspace starts here.
          </p>
        </div>
        <Link
          href="/privacy-policy"
          className="mt-5 text-xs text-text-sub-600 underline"
        >
          Privacy policy
        </Link>
      </aside>
      <div className="lg:pl-64">
        <header className="flex h-20 items-center justify-between border-b border-stroke-soft-200 bg-bg-white-0 px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Drawer.Root open={menuOpen} onOpenChange={setMenuOpen}>
              <Drawer.Trigger asChild>
                <Button.Root
                  aria-label="Open navigation"
                  variant="neutral"
                  mode="ghost"
                  className="lg:hidden"
                >
                  <Button.Icon as={RiMenuLine} />
                </Button.Root>
              </Drawer.Trigger>
              <Drawer.Content aria-describedby={undefined}>
                <Drawer.Header showCloseButton={false}>
                  <Drawer.Title>Speckvue navigation</Drawer.Title>
                  <Drawer.Close asChild>
                    <Button.Root
                      variant="neutral"
                      mode="ghost"
                      aria-label="Close navigation"
                    >
                      <Button.Icon as={RiCloseLine} />
                    </Button.Root>
                  </Drawer.Close>
                </Drawer.Header>
                <div className="p-6">
                  <Navigation />
                </div>
              </Drawer.Content>
            </Drawer.Root>
            <span className="text-sm text-text-sub-600">
              Workspace{' '}
              <span aria-hidden="true" className="px-2">
                /
              </span>
              <span className="font-medium text-text-strong-950">Overview</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Button.Root asChild variant="neutral" mode="stroke" size="small">
              <Link href="/sign-in">
                Sign in
                <Button.Icon as={RiArrowRightUpLine} />
              </Link>
            </Button.Root>
          </div>
        </header>
        <main
          id="main-content"
          className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-8"
        >
          {children}
        </main>
        <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-8 pb-8 text-xs text-text-sub-600">
          <span>Speckvue Finance · Frontend preview</span>
          <div className="flex gap-4">
            <Link href="/terms-of-service" className="underline">
              Terms
            </Link>
            <Link href="/cookie-policy" className="underline">
              Cookies
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AppShell;

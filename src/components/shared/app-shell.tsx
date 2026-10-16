'use client';

import AccountTheme from '@/features/preferences/components/account-theme';
import type { User } from '@/lib/auth/contracts';
import * as Dialog from '@radix-ui/react-dialog';
import {
  RiBankLine,
  RiCloseLine,
  RiContactsBookLine,
  RiExchangeDollarLine,
  RiHome5Line,
  RiMenuLine,
  RiPriceTag3Line,
  RiSettings3Line,
  RiUserLine,
} from '@remixicon/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Brand from './brand';
import ProfileMenu from './profile-menu';
import ScrollArea from './scroll-area';

const destinations = [
  { href: '/workspace', label: 'Overview', icon: RiHome5Line },
  { href: '/accounts', label: 'Accounts', icon: RiBankLine },
  { href: '/transactions', label: 'Transactions', icon: RiExchangeDollarLine },
  { href: '/categories', label: 'Categories', icon: RiPriceTag3Line },
  { href: '/payees', label: 'Payees', icon: RiContactsBookLine },
  { href: '/settings', label: 'Settings', icon: RiSettings3Line },
];

/** Provides the responsive product frame and keyboard-accessible mobile navigation. */
const AppShell = ({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) => {
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 48rem)');
    const closeOnDesktop = () => {
      if (media.matches) setMenuOpen(false);
    };
    media.addEventListener('change', closeOnDesktop);
    return () => media.removeEventListener('change', closeOnDesktop);
  }, []);
  const links = user.onboardedAt
    ? destinations
    : [{ href: '/onboarding', label: 'Setup', icon: RiUserLine }];
  const navigation = (
    <nav aria-label="Main navigation" className="finance-navigation">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={
            path === href || path.startsWith(href + '/') ? 'page' : undefined
          }
          onClick={() => setMenuOpen(false)}
        >
          <Icon size={21} aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
  return (
    <div className="finance-app">
      <AccountTheme user={user} />
      <a className="finance-skip" href="#workspace-content">
        Skip to content
      </a>
      <div className="finance-frame">
        <header className="finance-header">
          <div className="finance-header-brand">
            <Brand />
          </div>
          <div className="finance-header-actions">
            <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
              <Dialog.Trigger asChild>
                <button
                  className="finance-menu-button"
                  aria-label="Open navigation"
                >
                  <RiMenuLine size={22} aria-hidden="true" />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="finance-drawer-overlay" />
                <Dialog.Content
                  className="finance-drawer"
                  aria-describedby="navigation-description"
                >
                  <div className="finance-drawer-heading">
                    <Dialog.Title>Workspace</Dialog.Title>
                    <Dialog.Close asChild>
                      <button
                        className="finance-menu-button"
                        aria-label="Close navigation"
                      >
                        <RiCloseLine size={22} aria-hidden="true" />
                      </button>
                    </Dialog.Close>
                  </div>
                  <Dialog.Description
                    id="navigation-description"
                    className="sr-only"
                  >
                    Choose a page in your Speckvue Finance workspace.
                  </Dialog.Description>
                  {navigation}
                  <div className="finance-drawer-profile">
                    <ProfileMenu
                      user={user}
                      onNavigate={() => setMenuOpen(false)}
                    />
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </header>
        <div className="finance-body">
          <aside className="finance-sidebar">
            <ScrollArea label="Sidebar navigation">
              <div className="finance-sidebar-inner">
                <p className="finance-nav-caption">Workspace</p>
                {navigation}
              </div>
            </ScrollArea>
            <div className="finance-sidebar-profile">
              <ProfileMenu user={user} />
            </div>
          </aside>
          <main className="finance-main">
            <ScrollArea id="workspace-content" label="Workspace content">
              <div className="finance-main-inner">
                <div className="finance-content">{children}</div>
              </div>
            </ScrollArea>
          </main>
        </div>
      </div>
    </div>
  );
};
export default AppShell;

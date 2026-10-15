'use client';

import * as Dropdown from '@/components/ui/dropdown';
import SignoutButton from '@/features/auth/components/signout-button';
import type { User } from '@/lib/auth/contracts';
import { RiExpandUpDownLine, RiSettings3Line } from '@remixicon/react';
import Link from 'next/link';

const ProfileMenu = ({
  user,
  onNavigate,
}: {
  user: User;
  onNavigate?: () => void;
}) => (
  <Dropdown.Root modal={false}>
    <Dropdown.Trigger asChild>
      <button
        type="button"
        className="finance-profile"
        aria-label={`Open profile menu for ${user.displayName ?? user.email}`}
      >
        <span className="finance-profile-avatar" aria-hidden="true">
          {(user.displayName ?? user.email).slice(0, 1).toUpperCase()}
        </span>
        <span className="finance-profile-name">
          {user.displayName ?? user.email}
        </span>
        <RiExpandUpDownLine
          className="finance-profile-chevron"
          size={16}
          aria-hidden="true"
        />
      </button>
    </Dropdown.Trigger>
    <Dropdown.Content
      side="top"
      align="start"
      className="finance-profile-menu w-64"
    >
      <div className="px-2 py-3">
        <p className="truncate text-sm font-medium text-text-strong-950">
          {user.displayName ?? 'Your account'}
        </p>
        <p className="mt-1 truncate text-xs text-text-sub-600">{user.email}</p>
      </div>
      <Dropdown.Item asChild>
        <Link href="/settings" onClick={onNavigate}>
          <RiSettings3Line size={18} aria-hidden="true" />
          Settings
        </Link>
      </Dropdown.Item>
      <SignoutButton menuItem />
    </Dropdown.Content>
  </Dropdown.Root>
);
export default ProfileMenu;

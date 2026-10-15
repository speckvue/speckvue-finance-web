import { RiLoader4Line } from '@remixicon/react';

export default function AccountsLoading() {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-3 py-24 text-sm text-text-sub-600"
    >
      <RiLoader4Line className="animate-spin" size={22} aria-hidden="true" />
      Loading accounts…
    </div>
  );
}

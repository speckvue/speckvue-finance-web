import { accountTypes, accountsSchema } from '@/features/accounts/contracts';
import formatMoney from '@/features/accounts/format-money';
import backendFetch from '@/lib/auth/backend';
import requireUser from '@/lib/auth/session';
import {
  RiArrowRightLine,
  RiArrowRightUpLine,
  RiBankLine,
} from '@remixicon/react';
import Link from 'next/link';

export default async function WorkspacePage() {
  const user = await requireUser();
  const response = await backendFetch('/accounts');
  if (!response.ok) throw new Error('Unable to load your financial workspace');
  const accounts = accountsSchema.parse(await response.json());
  return (
    <div>
      <div className="workspace-heading">
        <div>
          <p>Overview</p>
          <h1>Welcome, {user.displayName}</h1>
        </div>
        <span className="workspace-currency">
          {user.baseCurrency} · Base currency
        </span>
      </div>
      <div className="workspace-overview-grid">
        <section className="workspace-intro">
          <div className="workspace-intro-top">
            <span>Make today count.</span>
            <RiArrowRightUpLine size={24} aria-hidden="true" />
          </div>
          <h2>
            A clearer view.
            <br />A better starting point.
          </h2>
          <p>
            Bring your accounts together and give your money a place to start.
          </p>
          <Link href="/accounts">
            Manage financial accounts
            <RiArrowRightLine size={20} aria-hidden="true" />
          </Link>
        </section>
        <section className="workspace-accounts">
          <div className="workspace-panel-heading">
            <h2>Your accounts</h2>
            <Link href="/accounts">
              View all<span className="sr-only"> accounts</span>
              <RiArrowRightUpLine size={17} aria-hidden="true" />
            </Link>
          </div>
          {accounts.items.length ? (
            <ul className="workspace-account-list">
              {accounts.items.slice(0, 3).map((account) => (
                <li key={account.id}>
                  <span className="workspace-account-icon">
                    <RiBankLine size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <p>{account.name}</p>
                    <small>{accountTypes[account.type]}</small>
                  </div>
                  <span>
                    {formatMoney(
                      account.openingBalance,
                      account.currency,
                      user.locale!,
                    )}
                    <small>Opening balance</small>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="workspace-accounts-empty">
              <RiBankLine size={30} aria-hidden="true" />
              <h3>Room for your first account.</h3>
              <p>
                Start with a bank account, a cash wallet, or a credit card. Add
                the opening balance you want to track.
              </p>
              <Link href="/accounts">
                Add your first account
                <RiArrowRightLine size={16} aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>
      </div>
      <section className="workspace-preferences">
        <div>
          <h2>Set up around you.</h2>
          <p>Your preferences keep your workspace familiar.</p>
          <Link href="/settings">
            Manage preferences and security
            <RiArrowRightUpLine size={16} aria-hidden="true" />
          </Link>
        </div>
        <dl>
          {[
            ['Base currency', user.baseCurrency],
            ['Timezone', user.timezone],
            ['Number format', user.locale],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

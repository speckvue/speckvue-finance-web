'use client';

import * as Button from '@/components/ui/button';
import * as Dropdown from '@/components/ui/dropdown';
import subscribe from '@/lib/utils/noop-subscribe';
import {
  RiCheckLine,
  RiComputerLine,
  RiMoonLine,
  RiSunLine,
} from '@remixicon/react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

const preferences = [
  { value: 'light', label: 'Light', icon: RiSunLine },
  { value: 'dark', label: 'Dark', icon: RiMoonLine },
  { value: 'system', label: 'System', icon: RiComputerLine },
] as const;

const ThemeSwitcher = () => {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const { theme, setTheme } = useTheme();
  const current = mounted ? (theme ?? 'system') : 'system';
  return (
    <Dropdown.Root modal={false}>
      <Dropdown.Trigger asChild>
        <Button.Root
          variant="neutral"
          mode="ghost"
          size="small"
          disabled={!mounted}
          aria-label={`Theme: ${current}. Choose appearance`}
        >
          <Button.Icon
            as={
              current === 'dark'
                ? RiMoonLine
                : current === 'light'
                  ? RiSunLine
                  : RiComputerLine
            }
          />
          <span className="hidden sm:inline">
            {current === 'dark'
              ? 'Dark'
              : current === 'light'
                ? 'Light'
                : 'System'}
          </span>
        </Button.Root>
      </Dropdown.Trigger>
      <Dropdown.Content align="end">
        <Dropdown.RadioGroup
          aria-label="Appearance"
          value={current}
          onValueChange={setTheme}
        >
          {preferences.map(({ value, label, icon }) => (
            <Dropdown.RadioItem
              key={value}
              value={value}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-strong-950 outline-none data-[highlighted]:bg-bg-weak-50"
            >
              <Dropdown.ItemIcon as={icon} />
              <span className="flex-1">{label}</span>
              <RiCheckLine
                aria-hidden="true"
                className={`size-4 ${current === value ? 'opacity-100' : 'opacity-0'}`}
              />
            </Dropdown.RadioItem>
          ))}
        </Dropdown.RadioGroup>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

export default ThemeSwitcher;

'use client';

// AlignUI Datepicker v0.0.0

import { compactButtonVariants } from '@/components/ui/compact-button';
import { cn } from '@/utils/cn';
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...rest
}: CalendarProps) {
  return (
    <DayPicker
      className={cn('relative w-fit', className)}
      showOutsideDays={showOutsideDays}
      classNames={{
        months: 'flex divide-x divide-stroke-soft-200',
        month: 'space-y-2 p-5',
        month_caption:
          'flex justify-center items-center relative rounded-lg bg-bg-weak-50 h-9',
        caption_label: 'text-label-sm text-text-sub-600 select-none',
        nav: 'absolute inset-x-5 top-5 z-10 flex h-9 items-center',
        button_previous: compactButtonVariants({
          variant: 'white',
          size: 'large',
        }).root({ class: 'absolute top-1/2 -translate-y-1/2 left-1.5' }),
        button_next: compactButtonVariants({
          variant: 'white',
          size: 'large',
        }).root({ class: 'absolute top-1/2 -translate-y-1/2 right-1.5' }),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex gap-2',
        weekday:
          'text-text-soft-400 text-label-sm uppercase size-10 flex items-center justify-center text-center select-none',
        week: 'grid grid-flow-col auto-cols-auto w-full mt-2 gap-2',
        day: cn(
          // base
          'group/cell relative size-10 shrink-0 select-none p-0',
          // range
          '[&.day-range-middle]:bg-primary-alpha-10',
          'first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg',
          // first range el
          '[&:not(:has(button))+:has(.day-range-middle)]:rounded-l-lg',
          // last range el
          '[&:not(:has(+_*_button))]:rounded-r-lg',
          // hide before if next sibling not selected
          '[&:not(:has(+_*_[type=button]))]:before:hidden',
          // merged bg
          'before:absolute before:inset-y-0 before:-right-2 before:hidden before:w-2 before:bg-primary-alpha-10',
          'last:[&.day-range-middle]:before:hidden',
          // middle
          '[&.day-range-middle]:before:block',
          // start
          '[&.day-range-start]:before:block [&.day-range-start]:before:w-3',
          // end
          '[&.day-range-end:not(:first-child)]:before:!block [&.day-range-end]:before:left-0 [&.day-range-end]:before:right-auto',
        ),
        day_button: cn(
          // base
          'flex size-10 shrink-0 items-center justify-center rounded-lg text-center text-label-sm text-text-sub-600 outline-none',
          'transition duration-200 ease-out',
          // hover
          'hover:bg-bg-weak-50 hover:text-text-strong-950',
          // selected
          'in-[.day-selected]:bg-primary-base in-[.day-selected]:text-static-white in-[.day-range-middle]:bg-transparent in-[.day-range-middle]:text-primary-base',
          // focus visible
          'focus:outline-none focus-visible:bg-bg-weak-50 focus-visible:text-text-strong-950',
        ),
        range_start: 'day-range-start',
        range_end: 'day-range-end',
        selected: 'day-selected',
        range_middle: 'day-range-middle !text-primary-base !bg-transparent',
        today: 'day-today',
        outside:
          'day-outside !text-text-disabled-300 aria-[selected]:!text-static-white',
        disabled: 'day-disabled !text-text-disabled-300',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <RiArrowLeftSLine className="size-5" />
          ) : (
            <RiArrowRightSLine className="size-5" />
          ),
      }}
      {...rest}
    />
  );
}

export { Calendar };

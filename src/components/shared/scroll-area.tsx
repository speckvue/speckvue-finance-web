'use client';

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';

/** Keeps native scrolling behavior with a draggable, theme-aware scrollbar. */
const ScrollArea = ({
  children,
  id,
  label,
}: {
  children: React.ReactNode;
  id?: string;
  label: string;
}) => (
  <ScrollAreaPrimitive.Root className="finance-scroll" type="auto">
    <ScrollAreaPrimitive.Viewport
      className="finance-scroll-viewport"
      id={id}
      tabIndex={0}
      role="region"
      aria-label={label}
    >
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar
      orientation="vertical"
      className="finance-scrollbar"
    >
      <ScrollAreaPrimitive.Thumb className="finance-scrollbar-thumb" />
    </ScrollAreaPrimitive.Scrollbar>
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
);

export default ScrollArea;

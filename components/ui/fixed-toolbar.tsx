'use client';

import { cn } from '@/lib/utils';

import { Toolbar } from './toolbar';

export function FixedToolbar(props: React.ComponentProps<typeof Toolbar>) {
  return (
    <Toolbar
      {...props}
      className={cn(
        'sticky top-0 left-0 z-50 scrollbar-hide w-full justify-between overflow-x-auto rounded-t-lg border-b border-b-border bg-[#18191A] p-1 backdrop-blur-sm supports-backdrop-blur:bg-[#18191A]',
        props.className,
      )}
    />
  );
}

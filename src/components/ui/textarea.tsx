'use client';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'> & { minRows?: number }
>(({ className, minRows = 1, ...props }, ref) => {
  const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    if (props.onInput) {
      props.onInput(event);
    }
  };

  return (
    <textarea
      className={cn(
        'flex min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm overflow-y-hidden',
        className
      )}
      ref={ref}
      rows={minRows}
      onInput={handleInput}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
 
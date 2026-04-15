import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background active:scale-95',
  {
    variants: {
      variant: {
        // Solid filled — always visible in any theme
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg border border-primary/20',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm border border-destructive/20',
        // Outline: use border-border (now properly contrasted) + solid bg-card (not transparent)
        outline:
          'border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground shadow-sm',
        // Secondary: solid secondary bg, never transparent
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border shadow-sm',
        // Ghost: text-foreground so it's visible; hover shows accent bg
        ghost:
          'text-foreground hover:bg-accent hover:text-accent-foreground',
        link:
          'text-primary underline-offset-4 hover:underline',
        glow:
          'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.6)] animate-pulse-glow border border-primary/20',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm:      'h-9 px-3 rounded-md text-xs',
        lg:      'h-11 px-8 rounded-md text-base',
        icon:    'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size:    'default',
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

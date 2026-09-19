import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-semibold ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] cursor-pointer selection:bg-none',
  {
    variants: {
      variant: {
        default:
          'bg-emerald-950 text-white hover:bg-emerald-900 shadow-sm border border-emerald-900',
        emerald: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm font-semibold',
        mint: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm font-semibold',
        terracotta: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm font-semibold',
        teal: 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm',
        destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
        outline:
          'border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 text-slate-700 shadow-2xs',
        secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/80',
        ghost: 'hover:bg-slate-100 hover:text-slate-900 text-slate-600',
        link: 'text-emerald-700 underline-offset-4 hover:underline font-semibold',
        amber: 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-[11px]',
        lg: 'h-10 rounded-md px-6 text-sm',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };

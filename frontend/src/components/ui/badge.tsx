import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors focus:outline-none focus:ring-1 focus:ring-ring',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-emerald-900 text-white font-medium',
        secondary: 'border-slate-200 bg-slate-100 text-slate-700 font-medium',
        destructive: 'border-red-200 bg-red-50 text-red-700 font-medium',
        outline: 'text-slate-700 border-slate-200 bg-transparent font-medium',
        terracotta: 'border-emerald-200 bg-emerald-50 text-emerald-800 font-medium',
        teal: 'border-emerald-200 bg-emerald-50 text-emerald-800 font-medium',
        sand: 'border-slate-200 bg-slate-100 text-slate-700 font-medium',
        carbon: 'border-emerald-200 bg-emerald-50 text-emerald-800 font-medium',
        biodiversity: 'border-emerald-200 bg-emerald-50 text-emerald-800 font-medium',
        reforestation: 'border-emerald-200 bg-emerald-50 text-emerald-800 font-medium',
        conservation: 'border-emerald-200 bg-emerald-50 text-emerald-800 font-medium',
        active: 'border-emerald-300 bg-emerald-50 text-emerald-800 font-medium',
        planning: 'border-amber-300 bg-amber-50 text-amber-800 font-medium',
        completed: 'border-slate-300 bg-slate-100 text-slate-700 font-medium',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants };

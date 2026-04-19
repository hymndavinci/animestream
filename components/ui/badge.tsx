import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur",
  {
    variants: {
      variant: {
        default: "border-pink-400/20 bg-pink-400/10 text-pink-100",
        secondary: "border-sky-400/20 bg-sky-400/10 text-sky-100",
        muted: "border-white/10 bg-white/5 text-zinc-300"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

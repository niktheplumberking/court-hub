import type { ButtonHTMLAttributes, ReactNode, AnchorHTMLAttributes } from "react";

type Variant = "lime" | "outline-white" | "outline-ink" | "ink";
type Size = "md" | "lg";

const variantClasses: Record<Variant, string> = {
  lime: "bg-lime text-ink hover:bg-lime/90 active:scale-[0.98]",
  "outline-white":
    "border border-white/30 text-white hover:bg-white/10 hover:border-white/60 active:scale-[0.98]",
  "outline-ink":
    "border border-ink/30 text-ink hover:bg-ink/10 hover:border-ink/60 active:scale-[0.98]",
  ink: "bg-ink text-white hover:bg-ink/90 active:scale-[0.98]",
};

const sizeClasses: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-7 text-base",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-all duration-200 ease-out cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime min-h-[44px]";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function Button({
  variant = "lime",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function LinkButton({
  variant = "lime",
  size = "md",
  className = "",
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <a
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef, ElementType } from "react";

type GlassVariant = "default" | "panel" | "elevated" | "subtle";
type GlassSize    = "sm" | "md" | "lg" | "none";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual hierarchy tier of the glass panel */
  variant?: GlassVariant;
  /** Internal padding preset */
  size?: GlassSize;
  /** Whether to show a neon cyan top-border accent line */
  accentTop?: boolean;
  /** Whether to add a hover glow effect */
  hoverable?: boolean;
}

const variantStyles: Record<GlassVariant, string> = {
  default: [
    "bg-[rgba(17,24,39,0.70)]",
    "backdrop-blur-[16px]",
    "border border-[rgba(30,45,66,0.80)]",
    "shadow-[0_8px_32px_rgba(0,0,0,0.50),inset_0_1px_0_rgba(255,255,255,0.06)]",
  ].join(" "),

  panel: [
    "bg-[rgba(11,15,25,0.85)]",
    "backdrop-blur-[24px]",
    "border border-[rgba(30,45,66,0.90)]",
    "shadow-[0_12px_40px_rgba(0,0,0,0.60),inset_0_1px_0_rgba(255,255,255,0.04)]",
  ].join(" "),

  elevated: [
    "bg-[rgba(26,34,53,0.80)]",
    "backdrop-blur-[20px]",
    "border border-[rgba(0,240,255,0.12)]",
    "shadow-[0_16px_48px_rgba(0,0,0,0.70),inset_0_1px_0_rgba(0,240,255,0.10)]",
  ].join(" "),

  subtle: [
    "bg-[rgba(17,24,39,0.40)]",
    "backdrop-blur-[8px]",
    "border border-[rgba(30,45,66,0.50)]",
    "shadow-[0_4px_16px_rgba(0,0,0,0.30)]",
  ].join(" "),
};

const sizeStyles: Record<GlassSize, string> = {
  sm:   "p-3",
  md:   "p-4",
  lg:   "p-6",
  none: "",
};

/**
 * GlassCard
 * ─────────
 * Reusable frosted glass container with Aviation Cockpit dark theme.
 *
 * @example
 * <GlassCard variant="elevated" accentTop hoverable>
 *   <p>Telemetry Data</p>
 * </GlassCard>
 */
const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      className,
      variant   = "default",
      size      = "md",
      accentTop = false,
      hoverable = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-2xl overflow-hidden",
          variantStyles[variant],
          sizeStyles[size],
          hoverable && [
            "transition-all duration-200 cursor-pointer",
            "hover:border-[rgba(0,240,255,0.25)]",
            "hover:shadow-[0_12px_48px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(0,240,255,0.15),0_0_24px_rgba(0,240,255,0.08)]",
          ],
          className
        )}
        {...props}
      >
        {/* ── Neon Top Accent Line ───────────────────────────────────── */}
        {accentTop && (
          <div
            aria-hidden="true"
            className="
              absolute top-0 left-0 right-0 h-px
              bg-gradient-to-r
              from-transparent
              via-[rgba(0,240,255,0.60)]
              to-transparent
            "
          />
        )}

        {/* ── Inner Glass Gradient Sheen ─────────────────────────────── */}
        <div
          aria-hidden="true"
          className="
            absolute inset-0 pointer-events-none
            bg-gradient-to-br
            from-[rgba(255,255,255,0.04)]
            to-transparent
            rounded-2xl
          "
        />

        {/* ── Content ───────────────────────────────────────────────── */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
export type { GlassCardProps, GlassVariant, GlassSize };

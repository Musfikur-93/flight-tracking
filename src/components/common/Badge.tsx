import { cn } from "@/lib/utils";
import { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant =
  | "active"
  | "scheduled"
  | "landed"
  | "delayed"
  | "diverted"
  | "emergency"
  | "domestic"
  | "international"
  | "neutral";

type BadgeSize = "xs" | "sm" | "md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Render a pulsing status dot before the label */
  pulseDot?: boolean;
  /** Render a small icon before the label */
  icon?: ReactNode;
}

const variantMap: Record<
  BadgeVariant,
  { bg: string; border: string; text: string; dot: string; label: string }
> = {
  active: {
    bg:     "bg-[rgba(0,240,255,0.10)]",
    border: "border-[rgba(0,240,255,0.35)]",
    text:   "text-[#00F0FF]",
    dot:    "bg-[#00F0FF]",
    label:  "ACTIVE",
  },
  scheduled: {
    bg:     "bg-[rgba(100,116,139,0.12)]",
    border: "border-[rgba(100,116,139,0.30)]",
    text:   "text-slate-400",
    dot:    "bg-slate-400",
    label:  "SCHEDULED",
  },
  landed: {
    bg:     "bg-[rgba(16,185,129,0.10)]",
    border: "border-[rgba(16,185,129,0.35)]",
    text:   "text-emerald-400",
    dot:    "bg-emerald-400",
    label:  "LANDED",
  },
  delayed: {
    bg:     "bg-[rgba(245,158,11,0.10)]",
    border: "border-[rgba(245,158,11,0.35)]",
    text:   "text-amber-400",
    dot:    "bg-amber-400",
    label:  "DELAYED",
  },
  diverted: {
    bg:     "bg-[rgba(139,92,246,0.12)]",
    border: "border-[rgba(139,92,246,0.35)]",
    text:   "text-violet-400",
    dot:    "bg-violet-400",
    label:  "DIVERTED",
  },
  emergency: {
    bg:     "bg-[rgba(239,68,68,0.12)]",
    border: "border-[rgba(239,68,68,0.45)]",
    text:   "text-red-400",
    dot:    "bg-red-500",
    label:  "EMERGENCY",
  },
  domestic: {
    bg:     "bg-[rgba(6,182,212,0.10)]",
    border: "border-[rgba(6,182,212,0.30)]",
    text:   "text-cyan-400",
    dot:    "bg-cyan-400",
    label:  "DOMESTIC",
  },
  international: {
    bg:     "bg-[rgba(99,102,241,0.10)]",
    border: "border-[rgba(99,102,241,0.30)]",
    text:   "text-indigo-400",
    dot:    "bg-indigo-400",
    label:  "INTL",
  },
  neutral: {
    bg:     "bg-[rgba(30,45,66,0.60)]",
    border: "border-[rgba(30,45,66,0.90)]",
    text:   "text-slate-400",
    dot:    "bg-slate-500",
    label:  "",
  },
};

const sizeMap: Record<BadgeSize, { badge: string; dot: string; text: string }> = {
  xs: { badge: "px-1.5 py-0.5 gap-1",  dot: "w-1.5 h-1.5", text: "text-[9px] tracking-[0.08em]" },
  sm: { badge: "px-2 py-0.5 gap-1.5",  dot: "w-1.5 h-1.5", text: "text-[10px] tracking-[0.08em]" },
  md: { badge: "px-2.5 py-1 gap-1.5",  dot: "w-2 h-2",     text: "text-xs tracking-[0.06em]" },
};

/**
 * Badge
 * ─────
 * Aviation-themed status badge for flight states.
 *
 * @example
 * <Badge variant="active" pulseDot />
 * <Badge variant="delayed" size="sm" pulseDot />
 */
export function Badge({
  variant   = "neutral",
  size      = "sm",
  pulseDot  = false,
  icon,
  children,
  className,
  ...props
}: BadgeProps) {
  const v = variantMap[variant];
  const s = sizeMap[size];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-mono font-semibold uppercase select-none",
        v.bg,
        v.border,
        v.text,
        s.badge,
        s.text,
        className
      )}
      {...props}
    >
      {pulseDot && (
        <span className="relative flex shrink-0">
          <span className={cn("animate-ping absolute inline-flex rounded-full opacity-60", v.dot, s.dot)} />
          <span className={cn("relative inline-flex rounded-full", v.dot, s.dot)} />
        </span>
      )}

      {icon && !pulseDot && (
        <span className="shrink-0 flex items-center">{icon}</span>
      )}

      <span>{children ?? v.label}</span>
    </span>
  );
}

export type { BadgeProps, BadgeSize };

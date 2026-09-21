"use client";

import { useStore } from "@nanostores/react";
import { accessState } from "@/store/access";
import { useHydrated } from "@/lib/useHydrated";

type MemberAccessCtaVariant =
  | "hero"
  | "product"
  | "closing"
  | "journal"
  | "article";

interface MemberAccessCtaProps {
  variant?: MemberAccessCtaVariant;
  tone?: "surface" | "primary";
}

const STATE_COPY = {
  unknown: {
    heading: "Member Access",
    body: "Botanica is invite-only. Member access details are available here.",
    action: "Member Access",
    href: "/invite",
  },
  guest: {
    heading: "Member Access",
    body: "Botanica is invite-only. Use a valid member invite to request access.",
    action: "Use your invite",
    href: "/invite",
  },
  pending: {
    heading: "Request under review",
    body: "We are still reviewing your request. Store access is not active yet.",
    action: "Check access status",
    href: "/invite",
  },
  rejected: {
    heading: "Request not approved",
    body: "If you have a valid member invite, you can submit a new request.",
    action: "Use your invite",
    href: "/invite",
  },
  approved: {
    heading: "Member access is active",
    body: "Your private Store is ready.",
    action: "Open Store",
    href: "/oils",
  },
} as const;

const buttonClass =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-3 font-label-sm text-label-sm uppercase tracking-widest font-bold text-on-primary transition-opacity hover:opacity-90 active:scale-[0.98]";
const secondaryClass =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-outline px-6 py-3 font-label-sm text-label-sm uppercase tracking-widest font-bold text-primary transition-colors hover:bg-surface-container active:scale-[0.98]";

export default function MemberAccessCta({
  variant = "journal",
  tone = "surface",
}: MemberAccessCtaProps) {
  const isHydrated = useHydrated();
  const access = useStore(accessState);
  const status = isHydrated
    ? access.status === "unknown"
      ? "guest"
      : access.status
    : "unknown";
  const copy = STATE_COPY[status];

  if (variant === "hero") {
    return (
      <a href={copy.href} className={buttonClass}>
        {copy.action}
      </a>
    );
  }

  if (variant === "product") {
    return (
      <a href={copy.href} className={buttonClass}>
        {copy.action}
      </a>
    );
  }

  const isPrimaryTone = tone === "primary";
  const panelClass = isPrimaryTone
    ? "rounded-2xl border border-white/20 bg-primary p-8 sm:p-10 space-y-5"
    : "rounded-2xl border border-outline-variant/50 bg-surface-container-low p-8 sm:p-10 space-y-5";
  const headingClass = isPrimaryTone ? "text-on-primary" : "text-primary";
  const bodyClass = isPrimaryTone
    ? "text-on-primary/80"
    : "text-on-surface-variant";
  const borderClass = isPrimaryTone
    ? "border-white/20"
    : "border-outline-variant/40";
  const ctaButtonClass = isPrimaryTone
    ? "inline-flex min-h-11 items-center justify-center rounded-full bg-secondary px-6 py-3 font-label-sm text-label-sm uppercase tracking-widest font-bold text-primary transition-opacity hover:opacity-90 active:scale-[0.98]"
    : buttonClass;
  const secondaryToneClass = isPrimaryTone
    ? "inline-flex min-h-11 items-center justify-center rounded-full border border-white/40 px-6 py-3 font-label-sm text-label-sm uppercase tracking-widest font-bold text-on-primary transition-colors hover:bg-white/10 active:scale-[0.98]"
    : secondaryClass;

  return (
    <section
      aria-labelledby={`${variant}-member-access-heading`}
      className={panelClass}
    >
      <div className="space-y-3">
        <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
          {copy.heading}
        </span>
        <h2
          id={`${variant}-member-access-heading`}
          className={`font-display-sm text-display-sm ${headingClass}`}
        >
          {copy.heading}
        </h2>
        <p
          className={`font-body-lg text-body-lg leading-relaxed max-w-[52ch] ${bodyClass}`}
        >
          {copy.body}
        </p>
      </div>

      {variant === "closing" && status === "approved" && (
        <p
          className={`font-body-lg text-body-lg leading-relaxed max-w-[52ch] ${bodyClass}`}
        >
          View current bottles and offers, or manage the invite link you can
          share with someone else.
        </p>
      )}

      {variant === "closing" && status === "guest" && (
        <ol
          className={`grid grid-cols-1 sm:grid-cols-2 gap-5 border-y ${borderClass} py-5`}
        >
          <li className="space-y-1">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
              01
            </span>
            <p className={`font-body-sm text-body-sm ${bodyClass}`}>
              Get an invite from a current member.
            </p>
          </li>
          <li className="space-y-1">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
              02
            </span>
            <p className={`font-body-sm text-body-sm ${bodyClass}`}>
              Open the invite link or enter the code.
            </p>
          </li>
          <li className="space-y-1">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
              03
            </span>
            <p className={`font-body-sm text-body-sm ${bodyClass}`}>
              Send your details for review.
            </p>
          </li>
          <li className="space-y-1">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
              04
            </span>
            <p className={`font-body-sm text-body-sm ${bodyClass}`}>
              If approved, your private Store access becomes active.
            </p>
          </li>
        </ol>
      )}

      <div className="flex flex-wrap gap-3">
        <a href={copy.href} className={ctaButtonClass}>
          {copy.action}
        </a>
        {status === "approved" && (
          <a href="/invite" className={secondaryToneClass}>
            Account &amp; Invites
          </a>
        )}
      </div>
    </section>
  );
}

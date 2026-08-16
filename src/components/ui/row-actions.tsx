"use client";

import type { LucideIcon } from "lucide-react";
import { Pencil, Archive, ArchiveRestore, UserPlus, UserMinus } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "accent" | "danger" | "muted";

const toneClass: Record<Tone, string> = {
  accent: "text-text-secondary hover:text-accent hover:bg-accent/10",
  danger: "text-text-secondary hover:text-danger hover:bg-danger/10",
  muted: "text-text-secondary/70 hover:text-text-primary hover:bg-surface",
};

export function IconAction({
  label,
  icon: Icon,
  onClick,
  tone = "accent",
  disabled,
}: {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  tone?: Tone;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center transition-colors duration-200",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        "disabled:pointer-events-none disabled:opacity-40",
        toneClass[tone],
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
    </button>
  );
}

export function RowActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-0.5">{children}</div>
  );
}

export function EditAction(props: { onClick: () => void; label?: string }) {
  return (
    <IconAction
      label={props.label ?? "Edit"}
      icon={Pencil}
      onClick={props.onClick}
    />
  );
}

export function ArchiveAction(props: {
  onClick: () => void;
  archived?: boolean;
}) {
  return props.archived ? (
    <IconAction
      label="Restore"
      icon={ArchiveRestore}
      onClick={props.onClick}
    />
  ) : (
    <IconAction
      label="Archive"
      icon={Archive}
      tone="danger"
      onClick={props.onClick}
    />
  );
}

export function AddMemberAction(props: { onClick: () => void }) {
  return (
    <IconAction label="Add member" icon={UserPlus} onClick={props.onClick} />
  );
}

export function RemoveMemberAction(props: { onClick: () => void }) {
  return (
    <IconAction
      label="Remove from team"
      icon={UserMinus}
      tone="danger"
      onClick={props.onClick}
    />
  );
}

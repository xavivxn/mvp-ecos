import type { ReactNode } from "react";
import { Ban, CloudOff, ShieldOff, CircleAlert } from "lucide-react";

const ICONS = {
  closed: Ban,
  not_eligible: ShieldOff,
  tsje_unavailable: CloudOff,
  default: CircleAlert,
};

export function StatusScreen({
  title,
  body,
  action,
  variant = "default",
}: {
  title: string;
  body: string;
  action?: ReactNode;
  variant?: keyof typeof ICONS;
}) {
  const Icon = ICONS[variant];
  return (
    <section className="mx-auto max-w-md px-4 py-16 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-surface-2 text-muted">
        <Icon className="h-5 w-5" />
      </span>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-muted">{body}</p>
      {action ? <div className="mt-8">{action}</div> : null}
    </section>
  );
}

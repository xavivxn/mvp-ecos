import type { ReactNode } from "react";

export function StatusScreen({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="font-display text-3xl">{title}</h1>
      <p className="mt-3 text-cream-dim">{body}</p>
      {action ? <div className="mt-8">{action}</div> : null}
    </section>
  );
}

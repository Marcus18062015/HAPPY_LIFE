"use client";

import { useTransition } from "react";

export default function ToggleButton({
  action,
  className = "",
  children,
}: {
  action: () => Promise<void>;
  className?: string;
  children: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => action())}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {children}
    </button>
  );
}

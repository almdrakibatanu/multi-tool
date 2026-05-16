type Props = {
  label: string;
  hint?: string;
  children: React.ReactNode;
};

export default function Field({ label, hint, children }: Props) {
  return (
    <label className="block">
      <div className="mb-1.5 text-sm font-medium text-foreground">{label}</div>
      {children}
      {hint ? <div className="mt-1 text-xs text-muted">{hint}</div> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition";

import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";

type Props = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export default function ToolHeader({ title, description, icon: Icon }: Props) {
  return (
    <div className="mb-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground transition"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Back To Home
      </Link>
      <div className="mt-6 flex items-start gap-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border text-accent">
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-muted">{description}</p>
        </div>
      </div>
    </div>
  );
}

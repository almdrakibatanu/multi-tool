import Link from "next/link";
import { Calculator, MapPin, Table2, ArrowRight } from "lucide-react";

const tools = [
  {
    href: "/cpm-calculator",
    title: "Cpm Calculator",
    description:
      "Calculate Cost Per Mille — find cost, impressions, or cpm given any two values.",
    icon: Calculator,
    accent: "from-indigo-50 to-white",
  },
  {
    href: "/zip-finder",
    title: "Zip Finder",
    description:
      "Look up postal codes by country, state, and city — or find every zip within a radius of an address.",
    icon: MapPin,
    accent: "from-emerald-50 to-white",
  },
  {
    href: "/csv-splitter",
    title: "Csv Splitter",
    description:
      "Split rows and columns by comma, space, or space-hyphen-space — clean, paste, copy.",
    icon: Table2,
    accent: "from-amber-50 to-white",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="mb-14">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
          Simple Tools, Done Right.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          A small collection of fast, focused utilities. No clutter, no signups, no dark patterns.
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${tool.accent} p-6 transition hover:border-accent hover:shadow-lg`}
            >
              <div className="flex items-start justify-between">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-card border border-border text-accent">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <ArrowRight
                  className="h-5 w-5 text-muted transition group-hover:translate-x-1 group-hover:text-accent"
                  strokeWidth={1.75}
                />
              </div>
              <h2 className="mt-5 text-xl font-semibold tracking-tight">{tool.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{tool.description}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import ToolHeader from "../components/ToolHeader";
import Field, { inputClass } from "../components/Field";

type Mode = "cpm" | "cost" | "impressions";

const modes: { value: Mode; label: string; hint: string }[] = [
  { value: "cpm", label: "Calculate Cpm", hint: "From cost and impressions" },
  { value: "cost", label: "Calculate Cost", hint: "From cpm and impressions" },
  { value: "impressions", label: "Calculate Impressions", hint: "From cost and cpm" },
];

function parseNum(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function formatNum(n: number, decimals = 2): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export default function CpmCalculatorPage() {
  const [mode, setMode] = useState<Mode>("cpm");
  const [cost, setCost] = useState("");
  const [impressions, setImpressions] = useState("");
  const [cpm, setCpm] = useState("");

  const result = useMemo(() => {
    const c = parseNum(cost);
    const i = parseNum(impressions);
    const m = parseNum(cpm);
    if (mode === "cpm" && c !== null && i !== null && i > 0) {
      return { value: (c / i) * 1000, label: "Cpm", prefix: "$", suffix: "" };
    }
    if (mode === "cost" && m !== null && i !== null) {
      return { value: (m * i) / 1000, label: "Cost", prefix: "$", suffix: "" };
    }
    if (mode === "impressions" && c !== null && m !== null && m > 0) {
      return { value: (c / m) * 1000, label: "Impressions", prefix: "", suffix: "" };
    }
    return null;
  }, [mode, cost, impressions, cpm]);

  function reset() {
    setCost("");
    setImpressions("");
    setCpm("");
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <ToolHeader
        title="Cpm Calculator"
        description="Cost Per Mille — the cost to deliver one thousand ad impressions."
        icon={Calculator}
      />

      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="mb-6">
          <div className="text-sm font-medium text-foreground mb-2">Mode</div>
          <div className="grid gap-2 sm:grid-cols-3">
            {modes.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                className={`text-left rounded-lg border px-4 py-3 transition ${
                  mode === m.value
                    ? "border-accent bg-accent-light"
                    : "border-border bg-card hover:border-accent/50"
                }`}
              >
                <div className="text-sm font-semibold">{m.label}</div>
                <div className="text-xs text-muted mt-0.5">{m.hint}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {mode !== "cost" && (
            <Field label="Cost" hint="Total spend in usd">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm">
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  className={`${inputClass} pl-7`}
                />
              </div>
            </Field>
          )}

          {mode !== "impressions" && (
            <Field label="Impressions" hint="Total ad views">
              <input
                type="text"
                inputMode="numeric"
                value={impressions}
                onChange={(e) => setImpressions(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </Field>
          )}

          {mode !== "cpm" && (
            <Field label="Cpm" hint="Cost per 1,000 impressions">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm">
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={cpm}
                  onChange={(e) => setCpm(e.target.value)}
                  placeholder="0.00"
                  className={`${inputClass} pl-7`}
                />
              </div>
            </Field>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent-light transition"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
            Reset
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-gradient-to-br from-indigo-50 to-white p-6 md:p-8">
        <div className="text-sm font-medium text-muted">Result</div>
        {result ? (
          <>
            <div className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
              {result.prefix}
              {formatNum(result.value, result.label === "Impressions" ? 0 : 2)}
              {result.suffix}
            </div>
            <div className="mt-1 text-sm text-muted">{result.label}</div>
          </>
        ) : (
          <div className="mt-2 text-muted">
            Enter values above to see the result.
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <div className="text-sm font-semibold mb-2">Formula</div>
        <div className="text-sm text-muted leading-relaxed">
          Cpm = (Cost / Impressions) × 1,000
          <br />
          Cost = (Cpm × Impressions) / 1,000
          <br />
          Impressions = (Cost / Cpm) × 1,000
        </div>
      </div>
    </div>
  );
}

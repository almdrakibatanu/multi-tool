"use client";

import { useMemo, useState } from "react";
import { Table2, Copy, Check, Download, Trash2 } from "lucide-react";
import ToolHeader from "../components/ToolHeader";
import Field, { inputClass } from "../components/Field";

type Delimiter = "comma" | "space" | "spaceDashSpace" | "tab" | "semicolon" | "pipe" | "custom";

const delimiters: { value: Delimiter; label: string; hint: string }[] = [
  { value: "comma", label: "Comma", hint: "Split on ," },
  { value: "space", label: "Space", hint: "Split on any whitespace" },
  { value: "spaceDashSpace", label: "Space Dash Space", hint: "Split on  -  pattern" },
  { value: "tab", label: "Tab", hint: "Split on tab character" },
  { value: "semicolon", label: "Semicolon", hint: "Split on ;" },
  { value: "pipe", label: "Pipe", hint: "Split on |" },
  { value: "custom", label: "Custom", hint: "Provide your own" },
];

function splitLine(line: string, delim: Delimiter, custom: string, trim: boolean): string[] {
  let parts: string[];
  switch (delim) {
    case "comma":
      parts = line.split(",");
      break;
    case "space":
      parts = line.split(/\s+/);
      break;
    case "spaceDashSpace":
      parts = line.split(/\s+-\s+/);
      break;
    case "tab":
      parts = line.split("\t");
      break;
    case "semicolon":
      parts = line.split(";");
      break;
    case "pipe":
      parts = line.split("|");
      break;
    case "custom":
      parts = custom ? line.split(custom) : [line];
      break;
  }
  return trim ? parts.map((p) => p.trim()).filter((p) => p.length > 0) : parts;
}

function toCsvCell(v: string): string {
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export default function CsvSplitterPage() {
  const [input, setInput] = useState("");
  const [delim, setDelim] = useState<Delimiter>("comma");
  const [custom, setCustom] = useState("");
  const [trim, setTrim] = useState(true);
  const [skipEmptyLines, setSkipEmptyLines] = useState(true);
  const [copied, setCopied] = useState(false);

  const rows = useMemo(() => {
    const lines = input.split(/\r?\n/);
    return lines
      .filter((l) => (skipEmptyLines ? l.trim().length > 0 : true))
      .map((line) => splitLine(line, delim, custom, trim));
  }, [input, delim, custom, trim, skipEmptyLines]);

  const maxCols = useMemo(() => rows.reduce((m, r) => Math.max(m, r.length), 0), [rows]);

  const csvOutput = useMemo(
    () =>
      rows
        .map((r) =>
          Array.from({ length: maxCols }, (_, i) => toCsvCell(r[i] ?? ""))
            .join(","),
        )
        .join("\n"),
    [rows, maxCols],
  );

  async function copyCsv() {
    await navigator.clipboard.writeText(csvOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadCsv() {
    const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "split-output.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function clearAll() {
    setInput("");
  }

  function pasteExample() {
    setInput(
      [
        "John Doe, 30, New York",
        "Jane Smith, 25, San Francisco",
        "Bob Johnson, 45, Chicago",
      ].join("\n"),
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <ToolHeader
        title="Csv Splitter"
        description="Paste any text — split rows by comma, space, space-dash-space, or your own delimiter."
        icon={Table2}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">Input</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={pasteExample}
                className="text-xs font-medium text-accent hover:underline"
              >
                Paste Example
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste rows here. Each line becomes one row."
            rows={14}
            className={`${inputClass} font-mono text-xs resize-y min-h-[260px]`}
          />

          <div className="mt-5 space-y-4">
            <Field label="Split By">
              <div className="grid gap-2 sm:grid-cols-2">
                {delimiters.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDelim(d.value)}
                    className={`text-left rounded-lg border px-3 py-2.5 transition ${
                      delim === d.value
                        ? "border-accent bg-accent-light"
                        : "border-border bg-card hover:border-accent/50"
                    }`}
                  >
                    <div className="text-sm font-semibold">{d.label}</div>
                    <div className="text-xs text-muted mt-0.5">{d.hint}</div>
                  </button>
                ))}
              </div>
            </Field>

            {delim === "custom" && (
              <Field label="Custom Delimiter">
                <input
                  type="text"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder="e.g. :: or ; "
                  className={inputClass}
                />
              </Field>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trim}
                  onChange={(e) => setTrim(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
                Trim Whitespace
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipEmptyLines}
                  onChange={(e) => setSkipEmptyLines(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
                Skip Empty Lines
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-semibold">Output</div>
              <div className="text-xs text-muted mt-0.5">
                {rows.length} {rows.length === 1 ? "Row" : "Rows"} · {maxCols}{" "}
                {maxCols === 1 ? "Column" : "Columns"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyCsv}
                disabled={rows.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent-light disabled:opacity-50 transition"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copy Csv
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={downloadCsv}
                disabled={rows.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 transition"
              >
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          </div>

          <div className="overflow-auto rounded-lg border border-border max-h-[520px]">
            {rows.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted">
                Paste some text to see the split table here.
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-background sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted w-10">#</th>
                    {Array.from({ length: maxCols }, (_, i) => (
                      <th key={i} className="px-3 py-2 text-left font-medium text-muted">
                        Col {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2 text-muted font-mono">{i + 1}</td>
                      {Array.from({ length: maxCols }, (_, j) => (
                        <td key={j} className="px-3 py-2 font-mono align-top">
                          {row[j] ?? <span className="text-muted">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { MapPin, Search, Loader2, Copy, Check, ExternalLink } from "lucide-react";
import ToolHeader from "../components/ToolHeader";
import Field, { inputClass } from "../components/Field";

type ZipResult = {
  postalCode: string;
  placeName: string;
  adminName1?: string;
  adminName2?: string;
  countryCode: string;
  lat?: number;
  lng?: number;
  distance?: number;
};

type Tab = "search" | "radius";

const COUNTRIES: { code: string; name: string }[] = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "AU", name: "Australia" },
  { code: "IN", name: "India" },
  { code: "BD", name: "Bangladesh" },
  { code: "PK", name: "Pakistan" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "JP", name: "Japan" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "ZA", name: "South Africa" },
];

export default function ZipFinderPage() {
  const [tab, setTab] = useState<Tab>("search");
  const [username, setUsername] = useState<string>(() => {
    if (typeof window === "undefined") return "demo";
    return localStorage.getItem("geonamesUsername") || "demo";
  });

  // search by region
  const [country, setCountry] = useState("US");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  // radius search
  const [address, setAddress] = useState("");
  const [radius, setRadius] = useState("10");
  const [unit, setUnit] = useState<"mi" | "km">("mi");

  const [results, setResults] = useState<ZipResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem("geonamesUsername", username);
  }, [username]);

  async function searchByRegion() {
    setLoading(true);
    setError(null);
    setInfo(null);
    setResults([]);
    try {
      const params = new URLSearchParams({
        country,
        maxRows: "200",
        username,
      });
      if (city.trim()) params.set("placename", city.trim());
      if (state.trim()) params.set("adminCode1", state.trim());

      const url = `https://secure.geonames.org/postalCodeSearchJSON?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status) {
        throw new Error(data.status.message || "Lookup failed.");
      }

      const codes: ZipResult[] = (data.postalCodes || []).map((p: Record<string, unknown>) => ({
        postalCode: String(p.postalCode ?? ""),
        placeName: String(p.placeName ?? ""),
        adminName1: p.adminName1 ? String(p.adminName1) : undefined,
        adminName2: p.adminName2 ? String(p.adminName2) : undefined,
        countryCode: String(p.countryCode ?? country),
        lat: typeof p.lat === "number" ? p.lat : undefined,
        lng: typeof p.lng === "number" ? p.lng : undefined,
      }));

      setResults(codes);
      if (codes.length === 0) setInfo("No postal codes found for those filters.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed.");
    } finally {
      setLoading(false);
    }
  }

  async function searchByRadius() {
    setLoading(true);
    setError(null);
    setInfo(null);
    setResults([]);
    try {
      const r = Number(radius);
      if (!address.trim()) throw new Error("Enter an address.");
      if (!Number.isFinite(r) || r <= 0) throw new Error("Enter a valid radius.");

      const geo = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          address.trim(),
        )}`,
      );
      const geoData = await geo.json();
      if (!Array.isArray(geoData) || geoData.length === 0) {
        throw new Error("Could not geocode that address.");
      }
      const { lat, lon } = geoData[0];

      const radiusKm = unit === "mi" ? r * 1.609344 : r;
      const params = new URLSearchParams({
        lat: String(lat),
        lng: String(lon),
        radius: String(Math.min(radiusKm, 30)),
        maxRows: "500",
        username,
      });

      const res = await fetch(
        `https://secure.geonames.org/findNearbyPostalCodesJSON?${params.toString()}`,
      );
      const data = await res.json();
      if (data.status) throw new Error(data.status.message || "Lookup failed.");

      const codes: ZipResult[] = (data.postalCodes || []).map((p: Record<string, unknown>) => ({
        postalCode: String(p.postalCode ?? ""),
        placeName: String(p.placeName ?? ""),
        adminName1: p.adminName1 ? String(p.adminName1) : undefined,
        adminName2: p.adminName2 ? String(p.adminName2) : undefined,
        countryCode: String(p.countryCode ?? ""),
        lat: typeof p.lat === "number" ? p.lat : undefined,
        lng: typeof p.lng === "number" ? p.lng : undefined,
        distance: typeof p.distance === "string" ? Number(p.distance) : (p.distance as number),
      }));

      setResults(codes);
      if (codes.length === 0) setInfo("No postal codes found in that radius.");
      else if (radiusKm > 30) {
        setInfo(
          "Note: GeoNames limits radius to 30 km — results capped at that distance from the address.",
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed.");
    } finally {
      setLoading(false);
    }
  }

  async function copyZips() {
    const text = results.map((r) => r.postalCode).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <ToolHeader
        title="Zip Finder"
        description="Look up postal codes by region or find every zip within a radius of an address."
        icon={MapPin}
      />

      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="mb-6 inline-flex rounded-lg border border-border bg-background p-1">
          <button
            type="button"
            onClick={() => setTab("search")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              tab === "search" ? "bg-card shadow-sm text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            By Country, State, City
          </button>
          <button
            type="button"
            onClick={() => setTab("radius")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              tab === "radius" ? "bg-card shadow-sm text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            By Address And Radius
          </button>
        </div>

        {tab === "search" ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Country">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={inputClass}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="State / Province" hint="Code or name — optional">
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. CA, NY, TX"
                className={inputClass}
              />
            </Field>
            <Field label="City" hint="Optional">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. San Francisco"
                className={inputClass}
              />
            </Field>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-[1fr_140px_120px]">
            <Field label="Address" hint="Street, city, country — any descriptive address">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 1600 Amphitheatre Pkwy, Mountain View, CA"
                className={inputClass}
              />
            </Field>
            <Field label="Radius">
              <input
                type="text"
                inputMode="decimal"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Unit">
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as "mi" | "km")}
                className={inputClass}
              >
                <option value="mi">Miles</option>
                <option value="km">Kilometers</option>
              </select>
            </Field>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={tab === "search" ? searchByRegion : searchByRadius}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60 transition"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            ) : (
              <Search className="h-4 w-4" strokeWidth={2} />
            )}
            {loading ? "Searching" : "Find Zip Codes"}
          </button>
          <div className="ml-auto flex items-center gap-2 text-xs text-muted">
            <label htmlFor="gn-user" className="font-medium">
              Geonames User:
            </label>
            <input
              id="gn-user"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-32 rounded-md border border-border bg-card px-2 py-1 text-xs"
            />
            <a
              href="https://www.geonames.org/login"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-accent hover:underline"
            >
              Get One <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        {info && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {info}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <div className="text-sm font-semibold">Results</div>
              <div className="text-xs text-muted mt-0.5">
                {results.length} Postal {results.length === 1 ? "Code" : "Codes"} Found
              </div>
            </div>
            <button
              type="button"
              onClick={copyZips}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent-light transition"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy All
                </>
              )}
            </button>
          </div>
          <div className="max-h-[500px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-background sticky top-0">
                <tr className="text-left text-xs font-medium text-muted">
                  <th className="px-6 py-3">Postal Code</th>
                  <th className="px-6 py-3">Place</th>
                  <th className="px-6 py-3">Region</th>
                  {tab === "radius" && <th className="px-6 py-3">Distance</th>}
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={`${r.postalCode}-${i}`} className="border-t border-border hover:bg-background">
                    <td className="px-6 py-3 font-mono font-medium">{r.postalCode}</td>
                    <td className="px-6 py-3">{r.placeName}</td>
                    <td className="px-6 py-3 text-muted">
                      {[r.adminName1, r.countryCode].filter(Boolean).join(", ")}
                    </td>
                    {tab === "radius" && (
                      <td className="px-6 py-3 text-muted">
                        {r.distance != null
                          ? unit === "mi"
                            ? `${(r.distance / 1.609344).toFixed(1)} mi`
                            : `${r.distance.toFixed(1)} km`
                          : "—"}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-sm text-muted">
        <strong className="text-foreground font-semibold">Note:</strong> Powered by free Geonames and
        OpenStreetMap apis. The default <code className="font-mono text-xs">demo</code> account is
        rate-limited; create a free Geonames username for higher limits.
      </div>
    </div>
  );
}

"use client";

import { useDeferredValue, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatTheme(theme) {
  return theme
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatRepo(repo) {
  return repo === "policyengine-us-data" ? "policyengine-us-data" : "policyengine-us";
}

function getCssVar(name, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

function CustomTooltip({ active, label, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-pe-container border border-pe-border-light bg-white p-3 shadow-lg">
      <p className="mb-2 text-sm font-semibold text-pe-text-primary">{label}</p>
      <div className="space-y-1 text-sm text-pe-text-secondary">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <span>{entry.name}</span>
            <span className="font-semibold text-pe-text-primary">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryIntro({ executiveSummary }) {
  const lines = executiveSummary
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(1, 4);

  return (
    <div className="space-y-3 text-sm leading-6 text-pe-text-secondary">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

function buildThemeRows(themeSummary) {
  const allThemes = new Set([
    ...Object.keys(themeSummary["policyengine-us"]?.signal || {}),
    ...Object.keys(themeSummary["policyengine-us-data"]?.signal || {}),
  ]);

  return [...allThemes]
    .map((theme) => ({
      theme,
      label: formatTheme(theme),
      policyengineUs: themeSummary["policyengine-us"]?.signal?.[theme] || 0,
      policyengineUsData: themeSummary["policyengine-us-data"]?.signal?.[theme] || 0,
    }))
    .sort(
      (a, b) =>
        b.policyengineUs +
        b.policyengineUsData -
        (a.policyengineUs + a.policyengineUsData),
    )
    .slice(0, 8);
}

function buildMetricCards(items) {
  const signalItems = items.filter((item) => !item.noise);
  const prBacked = signalItems.filter((item) => item.pr_numbers.length > 0).length;
  const latestDate = signalItems.reduce(
    (latest, item) => (item.date > latest ? item.date : latest),
    "",
  );
  return [
    {
      label: "Signal entries",
      value: signalItems.length,
      detail: "Excludes version bumps and routine sync commits",
    },
    {
      label: "PR-backed entries",
      value: prBacked,
      detail: "Resolved through cached GitHub PR metadata",
    },
    {
      label: "Repos covered",
      value: 2,
      detail: "policyengine-us and policyengine-us-data",
    },
    {
      label: "Latest change",
      value: latestDate,
      detail: "Current cutoff in the local inventory",
    },
  ];
}

function topThemesForItems(items) {
  const counts = new Map();
  for (const item of items) {
    if (item.noise) {
      continue;
    }
    for (const theme of item.themes) {
      counts.set(theme, (counts.get(theme) || 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export default function DashboardClient({
  executiveSummary,
  inventory,
  themeSummary,
}) {
  const [search, setSearch] = useState("");
  const [repoFilter, setRepoFilter] = useState("all");
  const [themeFilter, setThemeFilter] = useState("all");
  const [hasMounted, setHasMounted] = useState(false);
  const [colors, setColors] = useState({
    policyengineUs: "#1f6f78",
    policyengineUsData: "#c56c2f",
  });
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    setHasMounted(true);
    setColors({
      policyengineUs: getCssVar("--pe-color-primary-600", "#1f6f78"),
      policyengineUsData: getCssVar("--pe-color-primary-200", "#c56c2f"),
    });
  }, []);

  const themeRows = buildThemeRows(themeSummary);
  const metricCards = buildMetricCards(inventory);
  const themeOptions = [...new Set(inventory.flatMap((item) => item.themes))].sort();

  const filteredItems = inventory
    .filter((item) => !item.noise)
    .filter((item) => repoFilter === "all" || item.repo === repoFilter)
    .filter((item) => themeFilter === "all" || item.themes.includes(themeFilter))
    .filter((item) => {
      const query = deferredSearch.trim().toLowerCase();
      if (!query) {
        return true;
      }

      const haystack = [
        item.repo,
        item.date,
        item.resolved_title,
        item.pr_summary,
        item.subject,
        item.themes.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const filteredThemeCounts = topThemesForItems(filteredItems).slice(0, 10);

  return (
    <main className="pe-shell space-y-6">
      <section className="pe-panel overflow-hidden">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.4fr_0.9fr] lg:px-8">
          <div className="space-y-5">
            <div className="pe-label">PolicyEngine new-tool style dashboard</div>
            <div className="max-w-4xl space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-pe-text-primary sm:text-5xl">
                Improvements to PolicyEngine US since January 1, 2026
              </h1>
              <p className="max-w-3xl text-base leading-7 text-pe-text-secondary sm:text-lg">
                This app reads the local analysis inventory directly from the workspace
                and turns it into a searchable, token-styled dashboard for
                <span className="font-semibold text-pe-text-primary"> policyengine-us </span>
                and
                <span className="font-semibold text-pe-text-primary">
                  {" "}policyengine-us-data
                </span>.
              </p>
            </div>
            <SummaryIntro executiveSummary={executiveSummary} />
          </div>

          <div className="rounded-pe-container border border-pe-border-light bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(244,249,248,0.96))] p-5">
            <div className="pe-label">Current read</div>
            <div className="mt-3 space-y-3 text-sm leading-6 text-pe-text-secondary">
              <p>
                <span className="font-semibold text-pe-text-primary">
                  policyengine-us
                </span>{" "}
                broadened the policy surface: 2025 baseline tax refreshes,
                2026 reform coverage, national TANF wiring, and stronger federal
                health and tax modeling.
              </p>
              <p>
                <span className="font-semibold text-pe-text-primary">
                  policyengine-us-data
                </span>{" "}
                strengthened the backend: block-first calibration, richer
                imputation, better take-up assignment, and stronger validation.
              </p>
              <p className="rounded-pe-element bg-pe-primary-50 px-3 py-3 text-pe-text-primary">
                The strongest overall pattern is a broader front-end model paired with a
                more credible calibration and imputation spine underneath it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <article key={card.label} className="pe-card">
            <div className="pe-label">{card.label}</div>
            <div className="mt-3 text-3xl font-semibold tracking-tight text-pe-text-primary">
              {card.value}
            </div>
            <p className="mt-2 text-sm leading-6 text-pe-text-secondary">{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="pe-panel p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="pe-label">Theme coverage</div>
              <h2 className="mt-2 text-2xl font-semibold text-pe-text-primary">
                Highest-volume improvement areas
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-pe-text-secondary">
              <span className="pe-chip">policyengine-us</span>
              <span className="pe-chip">policyengine-us-data</span>
            </div>
          </div>
          <div className="mt-6 h-[360px]">
            {hasMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={themeRows}
                  layout="vertical"
                  margin={{ top: 4, right: 12, left: 12, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#d9e1e0" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    width={170}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f3f7f6" }} />
                  <Bar
                    dataKey="policyengineUs"
                    name="policyengine-us"
                    fill={colors.policyengineUs}
                    radius={[0, 8, 8, 0]}
                  />
                  <Bar
                    dataKey="policyengineUsData"
                    name="policyengine-us-data"
                    fill={colors.policyengineUsData}
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-pe-container bg-pe-gray-50 text-sm text-pe-text-secondary">
                Loading chart…
              </div>
            )}
          </div>
        </article>

        <article className="pe-panel p-5 sm:p-6">
          <div className="pe-label">Filter snapshot</div>
          <h2 className="mt-2 text-2xl font-semibold text-pe-text-primary">
            Top themes in the current view
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {filteredThemeCounts.map(([theme, count]) => (
              <button
                key={theme}
                className="pe-chip cursor-pointer hover:border-pe-primary-500"
                onClick={() => setThemeFilter(theme)}
                type="button"
              >
                {formatTheme(theme)}: {count}
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-pe-container bg-pe-gray-50 p-4 text-sm leading-6 text-pe-text-secondary">
            Search works across dates, titles, PR summaries, repo names, and theme tags.
            The list below excludes pure version-bump noise by default.
          </div>
        </article>
      </section>

      <section className="pe-panel p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_0.8fr_0.8fr]">
          <label className="space-y-2">
            <span className="pe-label">Search</span>
            <input
              className="pe-input w-full"
              type="search"
              placeholder="Search titles, summaries, themes, or dates"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="pe-label">Repo</span>
            <select
              className="pe-input w-full"
              value={repoFilter}
              onChange={(event) => setRepoFilter(event.target.value)}
            >
              <option value="all">All repos</option>
              <option value="policyengine-us">policyengine-us</option>
              <option value="policyengine-us-data">policyengine-us-data</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="pe-label">Theme</span>
            <select
              className="pe-input w-full"
              value={themeFilter}
              onChange={(event) => setThemeFilter(event.target.value)}
            >
              <option value="all">All themes</option>
              {themeOptions.map((theme) => (
                <option key={theme} value={theme}>
                  {formatTheme(theme)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="pe-label">Inventory</div>
            <h2 className="mt-2 text-2xl font-semibold text-pe-text-primary">
              {filteredItems.length} visible changes
            </h2>
          </div>
          <div className="text-sm text-pe-text-secondary">
            Data source: local git history + cached GitHub PR metadata
          </div>
        </div>

        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <article key={`${item.repo}-${item.sha}`} className="pe-panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-pe-text-secondary">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="pe-chip">{formatRepo(item.repo)}</span>
                  <span>{item.date}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.themes.map((theme) => (
                    <button
                      key={theme}
                      className="pe-chip cursor-pointer hover:border-pe-primary-500"
                      onClick={() => setThemeFilter(theme)}
                      type="button"
                    >
                      {formatTheme(theme)}
                    </button>
                  ))}
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-pe-text-primary">
                {item.resolved_title}
              </h3>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-pe-text-secondary">
                {item.pr_summary || item.subject}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                {item.pr_url ? (
                  <a
                    className="font-medium text-pe-primary-700 hover:text-pe-primary-600"
                    href={item.pr_url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open PR
                  </a>
                ) : null}
                <span className="text-pe-text-tertiary">{item.sha.slice(0, 10)}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

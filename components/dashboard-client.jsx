"use client";

import { useDeferredValue, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const LABEL_OVERRIDES = {
  state_tax_policy: "State Tax Policy",
  benefits_and_childcare: "Benefits And Childcare",
  federal_tax_policy: "Federal Tax Policy",
  health_and_safety_net: "Health And Safety Net",
  calibration_and_data_pipeline: "Calibration And Data Pipeline",
  geography_and_local_area: "Geography And Local Area",
  quality_tooling_and_docs: "Quality, Tooling, And Docs",
  state_tax_and_legislation: "State Tax And Legislation",
  state_benefits_and_childcare: "State Benefits And Childcare",
  federal_tax_and_retirement: "Federal Tax And Retirement",
  federal_benefits_and_health: "Federal Benefits And Health",
  geography_and_baseline_inputs: "Geography And Baseline Inputs",
  calibration_pipeline: "Calibration Pipeline",
  imputation_and_new_variables: "Imputation And New Variables",
  takeup_and_participation: "Take-up And Participation",
  geography_and_dataset_build: "Geography And Dataset Build",
  validation_and_ci: "Validation And CI",
  new_coverage: "New Coverage",
  annual_update: "Annual Update",
  reform_modeling: "Reform Modeling",
  historical_backfill: "Historical Backfill",
  bug_fix: "Bug Fix",
  infrastructure: "Infrastructure",
  testing_validation: "Testing And Validation",
  performance: "Performance",
  documentation: "Documentation",
  state_income_tax: "State Income Tax",
  property_tax_relief: "Property Tax Relief",
  ctc: "CTC",
  eitc: "EITC",
  childcare: "Childcare",
  tanf: "TANF",
  aca: "ACA / PTC",
  medicaid_chip: "Medicaid / CHIP",
  snap_school_meals: "SNAP / School Meals",
  social_security_retirement: "Social Security / Retirement",
  filing_behavior: "Filing Behavior",
  geography_local_area: "Geography / Local Area",
  calibration: "Calibration",
  imputation: "Imputation",
  takeup: "Take-up",
  validation_tooling: "Validation / Tooling",
  long_run_projections: "Long-run Projections",
  district_level_geography: "District-Level Geography",
  state_aware_imputation: "State-Aware Imputation",
  top_end_income_modeling: "Top-End Income Modeling",
  census_block_assignment: "Census-Block Assignment",
  takeup_modeling: "Take-up Modeling",
  targets_database_and_schema: "Targets Database And Schema",
  calibration_target_expansion: "Calibration Target Expansion",
  unified_national_calibration: "Unified National Calibration",
  modal_gpu_pipeline: "Modal / GPU Pipeline",
  provenance_and_quality_gates: "Provenance And Quality Gates",
  sample_reforms_and_trackers: "Sample Reforms And Trackers",
  policy_surface_expansion: "Policy Surface Expansion",
  tanf_nationalization: "51-State TANF Coverage",
  childcare_infrastructure: "Childcare Infrastructure",
  health_coverage_realism: "ACA And Medicaid Realism",
  state_tax_refresh: "State Tax Refresh And Reform Depth",
  local_tax_depth: "Local Tax And Property Relief Depth",
  district_calibration: "District-Level Calibration",
  high_income_realism: "High-Income Realism",
  retirement_social_security_upgrade: "Retirement And Social Security Upgrades",
  calibration_platform_maturity: "Calibration Platform Maturity",
  filer_behavior_and_taxsim: "Filer Behavior And TAXSIM Validation",
  other: "Other",
};

const CONCEPT_DETAILS = {
  district_level_geography:
    "Tracks the move from broad geography to district- and block-aware modeling, including congressional districts, state legislative districts, at-large fixes, and block-level assignment.",
  state_aware_imputation:
    "Covers the newer imputation work that uses state context directly, especially for rent, real estate taxes, hourly wages, and other geographically sensitive variables.",
  top_end_income_modeling:
    "Captures the effort to model ultra-high incomes more realistically, including better high-AGI imputation, capital-income predictors, and calibration safeguards for very rich households.",
  census_block_assignment:
    "Groups the donor-household assignment redesign: clone strategy, population-weighted block sampling, and AGI-aware placement into plausible census blocks.",
  takeup_modeling:
    "Covers state-aware participation rates, seeded take-up assignments, and the reproducibility work needed to keep program participation stable across rebuilds.",
  targets_database_and_schema:
    "Represents the target-database hardening work: schema enforcement, validation triggers, clearer views, and distinct IDs that make calibration targets governable.",
  calibration_target_expansion:
    "Covers the growing target set itself: new pregnancy, retirement, reconciliation, wage, and hierarchical uprating targets that deepen calibration fidelity.",
  unified_national_calibration:
    "Represents consolidation of districts, states, cities, and national calibration into one coordinated artifact, especially the US.h5-based workflow.",
  modal_gpu_pipeline:
    "Captures the operational leap from ad hoc external fitting to a restartable, checkpointed, GPU-backed Modal pipeline that scales out heavy calibration jobs.",
  provenance_and_quality_gates:
    "Covers lineage, run IDs, hashing, staging and promotion controls, sanity checks, and the broader quality-gate work around trustworthy data releases.",
  sample_reforms_and_trackers:
    "Groups concrete analysis products and exemplars such as charitable-deduction work, Van Hollen-style reforms, and state legislative tracker concepts.",
  policy_surface_expansion:
    "Captures expansion of the modeled policy surface and surrounding research products, including TANF, CCDF, SSI supplements, LIHEAP, Taxsim, and related tools.",
};

function formatLabel(value) {
  if (!value) {
    return "";
  }
  return (
    LABEL_OVERRIDES[value] ||
    value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  );
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

function countValues(items, key, { multiple = false, skip = new Set() } = {}) {
  const counts = new Map();
  for (const item of items) {
    const rawValues = multiple ? item[key] || [] : [item[key]];
    for (const value of rawValues) {
      if (!value || skip.has(value)) {
        continue;
      }
      counts.set(value, (counts.get(value) || 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function buildMetricCards(items) {
  if (!items.length) {
    return [
      { label: "Visible changes", value: 0, detail: "No items match the current filters." },
      { label: "Active months", value: 0, detail: "No months in scope." },
      { label: "Top category", value: "None", detail: "No primary domain selected." },
      { label: "Busiest month", value: "None", detail: "No monthly trend available." },
    ];
  }

  const activeMonths = new Set(items.map((item) => item.month)).size;
  const topDomain = countValues(items, "primary_domain")[0];
  const busiestMonth = countValues(items, "month")[0];

  return [
    {
      label: "Visible changes",
      value: items.length,
      detail: "Current filtered view across both repos.",
    },
    {
      label: "Active months",
      value: activeMonths,
      detail: "How many months this slice stayed active.",
    },
    {
      label: "Top category",
      value: topDomain ? formatLabel(topDomain[0]) : "None",
      detail: topDomain ? `${topDomain[1]} matching changes.` : "No category data.",
    },
    {
      label: "Busiest month",
      value: busiestMonth ? busiestMonth[0] : "None",
      detail: busiestMonth ? `${busiestMonth[1]} matching changes.` : "No trend data.",
    },
  ];
}

function buildDomainRows(items) {
  const rows = new Map();
  for (const item of items) {
    const key = item.primary_domain;
    const existing = rows.get(key) || {
      domain: key,
      label: formatLabel(key),
      policyengineUs: 0,
      policyengineUsData: 0,
    };
    if (item.repo === "policyengine-us") {
      existing.policyengineUs += 1;
    } else {
      existing.policyengineUsData += 1;
    }
    rows.set(key, existing);
  }
  return [...rows.values()]
    .sort(
      (a, b) =>
        b.policyengineUs +
        b.policyengineUsData -
        (a.policyengineUs + a.policyengineUsData),
    )
    .slice(0, 8);
}

function buildMonthRows(items) {
  const months = [...new Set(items.map((item) => item.month))].sort();
  return months.map((month) => ({
    month,
    policyengineUs: items.filter(
      (item) => item.month === month && item.repo === "policyengine-us",
    ).length,
    policyengineUsData: items.filter(
      (item) => item.month === month && item.repo === "policyengine-us-data",
    ).length,
  }));
}

function buildMultiValueStorylines(items, key, { skip = new Set(["other"]) } = {}) {
  const byTag = new Map();
  for (const item of items) {
    for (const tag of item[key] || []) {
      if (!tag || skip.has(tag)) {
        continue;
      }
      const bucket = byTag.get(tag) || [];
      bucket.push(item);
      byTag.set(tag, bucket);
    }
  }

  return [...byTag.entries()]
    .map(([tag, taggedItems]) => {
      const monthCounts = countValues(taggedItems, "month");
      const months = [...new Set(taggedItems.map((item) => item.month))].sort();
      const repoCounts = countValues(taggedItems, "repo");
      const sampleTitles = [];
      const seenTitles = new Set();
      for (const item of taggedItems) {
        if (seenTitles.has(item.resolved_title)) {
          continue;
        }
        seenTitles.add(item.resolved_title);
        sampleTitles.push(item.resolved_title);
        if (sampleTitles.length >= 3) {
          break;
        }
      }
      return {
        tag,
        count: taggedItems.length,
        firstMonth: months[0] || "",
        peakMonth: monthCounts[0]?.[0] || "",
        peakCount: monthCounts[0]?.[1] || 0,
        lastMonth: months.at(-1) || "",
        repos: repoCounts,
        sampleTitles,
      };
    })
    .sort((a, b) => b.count - a.count);
}

function buildStorylines(items) {
  return buildMultiValueStorylines(items, "topical_tags");
}

function buildConceptStorylines(items) {
  return buildMultiValueStorylines(items, "concept_tags");
}

function buildMilestoneStorylines(items) {
  return buildMultiValueStorylines(items, "milestone_tags", { skip: new Set() });
}

function buildFilterOptions(items, key, { multiple = false, skip = new Set() } = {}) {
  return countValues(items, key, { multiple, skip }).map(([value]) => value);
}

function SummaryIntro({ executiveSummary }) {
  const lines = executiveSummary
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(1, 5);

  return (
    <div className="space-y-3 text-sm leading-6 text-pe-text-secondary">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
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

function ChartFrame({ hasMounted, children }) {
  if (!hasMounted) {
    return (
      <div className="flex h-full items-center justify-center rounded-pe-container bg-pe-gray-50 text-sm text-pe-text-secondary">
        Loading chart…
      </div>
    );
  }
  return children;
}

export default function DashboardClient({
  executiveSummary,
  inventory,
  taxonomySummary,
  timelineSummary,
}) {
  const signalItems = inventory.filter((item) => !item.noise);
  const [search, setSearch] = useState("");
  const [repoFilter, setRepoFilter] = useState("all");
  const [quarterFilter, setQuarterFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [changeFilter, setChangeFilter] = useState("all");
  const [conceptFilter, setConceptFilter] = useState("all");
  const [milestoneFilter, setMilestoneFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
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

  const quarterOptions = buildFilterOptions(signalItems, "quarter");
  const domainOptions = buildFilterOptions(signalItems, "primary_domain", {
    skip: new Set(["other"]),
  });
  const changeOptions = buildFilterOptions(signalItems, "change_tags", {
    multiple: true,
    skip: new Set(["other"]),
  });
  const conceptOptions = buildFilterOptions(signalItems, "concept_tags", {
    multiple: true,
    skip: new Set(["other"]),
  });
  const milestoneOptions = buildFilterOptions(signalItems, "milestone_tags", {
    multiple: true,
    skip: new Set(),
  });
  const tagOptions = buildFilterOptions(signalItems, "topical_tags", {
    multiple: true,
    skip: new Set(["other"]),
  });

  const filteredItems = signalItems
    .filter((item) => repoFilter === "all" || item.repo === repoFilter)
    .filter((item) => quarterFilter === "all" || item.quarter === quarterFilter)
    .filter((item) => domainFilter === "all" || item.primary_domain === domainFilter)
    .filter((item) => changeFilter === "all" || item.change_tags.includes(changeFilter))
    .filter(
      (item) => conceptFilter === "all" || item.concept_tags.includes(conceptFilter),
    )
    .filter(
      (item) => milestoneFilter === "all" || item.milestone_tags.includes(milestoneFilter),
    )
    .filter((item) => tagFilter === "all" || item.topical_tags.includes(tagFilter))
    .filter((item) => {
      const query = deferredSearch.trim().toLowerCase();
      if (!query) {
        return true;
      }
      const haystack = [
        item.repo,
        item.date,
        item.quarter,
        item.primary_domain,
        item.primary_theme,
        item.change_tags.join(" "),
        item.concept_tags.join(" "),
        item.milestone_tags.join(" "),
        item.topical_tags.join(" "),
        item.resolved_title,
        item.pr_summary,
        item.subject,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const metricCards = buildMetricCards(filteredItems);
  const domainRows = buildDomainRows(filteredItems);
  const monthRows = buildMonthRows(filteredItems);
  const milestoneMetadata = Object.fromEntries(
    (taxonomySummary.milestone_cards || []).map((card) => [card.id, card]),
  );
  const allMilestoneStorylines = buildMilestoneStorylines(filteredItems).map((storyline) => ({
    ...storyline,
    label: milestoneMetadata[storyline.tag]?.label || formatLabel(storyline.tag),
    description: milestoneMetadata[storyline.tag]?.description || "",
    tweet_angle: milestoneMetadata[storyline.tag]?.tweet_angle || "",
  }));
  const milestoneStorylines = allMilestoneStorylines.slice(0, 6);
  const allConceptStorylines = buildConceptStorylines(filteredItems);
  const conceptStorylines = allConceptStorylines.slice(0, 6);
  const storylines = buildStorylines(filteredItems).slice(0, 6);
  const topChangeTags = countValues(filteredItems, "change_tags", {
    multiple: true,
    skip: new Set(["other"]),
  }).slice(0, 8);
  const topConcepts = countValues(filteredItems, "concept_tags", {
    multiple: true,
    skip: new Set(["other"]),
  }).slice(0, 10);
  const topMilestones = countValues(filteredItems, "milestone_tags", {
    multiple: true,
    skip: new Set(),
  }).slice(0, 8);
  const topThemes = countValues(filteredItems, "themes", {
    multiple: true,
    skip: new Set(["other"]),
  }).slice(0, 8);
  const topTags = countValues(filteredItems, "topical_tags", {
    multiple: true,
    skip: new Set(["other"]),
  }).slice(0, 10);
  const overallConcepts = taxonomySummary.concept_storylines.slice(0, 4);
  const overallMilestones = (taxonomySummary.milestone_cards || []).slice(0, 4);
  const activeTimelineRows =
    quarterFilter === "all"
      ? timelineSummary
      : timelineSummary.filter((row) => row.quarter === quarterFilter);
  const selectedMilestone =
    milestoneFilter === "all" ? milestoneStorylines[0]?.tag || null : milestoneFilter;
  const selectedMilestoneStoryline =
    allMilestoneStorylines.find((storyline) => storyline.tag === selectedMilestone) || null;
  const selectedConcept =
    conceptFilter === "all" ? conceptStorylines[0]?.tag || null : conceptFilter;
  const selectedConceptStoryline =
    allConceptStorylines.find((storyline) => storyline.tag === selectedConcept) || null;

  return (
    <main className="pe-shell space-y-6">
      <section className="pe-panel overflow-hidden">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.25fr_0.95fr] lg:px-8">
          <div className="space-y-5">
            <div className="pe-label">PolicyEngine improvements taxonomy</div>
            <div className="max-w-4xl space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-pe-text-primary sm:text-5xl">
                Understand what improved, how it clustered, and when it accelerated
              </h1>
              <p className="max-w-3xl text-base leading-7 text-pe-text-secondary sm:text-lg">
                This dashboard now tags each change by primary domain, change type,
                concept lens, milestone bundle, topical tags, month, and quarter.
                The goal is to move from raw PR enumeration to a navigable picture
                of how the US model stack evolved over 2026.
              </p>
            </div>
            <SummaryIntro executiveSummary={executiveSummary} />
          </div>

          <div className="rounded-pe-container border border-pe-border-light bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(242,249,247,0.96))] p-5">
            <div className="pe-label">Largest concept lenses this year</div>
            <div className="mt-4 space-y-3">
              {overallConcepts.map((storyline) => (
                <button
                  key={storyline.tag}
                  className="w-full rounded-pe-element border border-pe-border-light bg-white px-4 py-3 text-left transition hover:border-pe-primary-500"
                  onClick={() => setConceptFilter(storyline.tag)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-pe-text-primary">
                      {formatLabel(storyline.tag)}
                    </span>
                    <span className="text-sm text-pe-text-secondary">
                      {storyline.count} changes
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-pe-text-secondary">
                    {storyline.first_month} to {storyline.last_month}
                    {" · "}
                    peak in {storyline.peak_month}
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-pe-text-secondary">
              Tags are heuristic. They come from PR titles, PR summaries, and local
              code-verified synthesis, so they are best used as navigation and
              summarization aids rather than strict canonical labels.
            </p>
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

      <section className="pe-panel p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
          <label className="space-y-2 xl:col-span-2">
            <span className="pe-label">Search</span>
            <input
              className="pe-input w-full"
              type="search"
              placeholder="Search titles, tags, themes, months, or summaries"
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
            <span className="pe-label">Quarter</span>
            <select
              className="pe-input w-full"
              value={quarterFilter}
              onChange={(event) => setQuarterFilter(event.target.value)}
            >
              <option value="all">All quarters</option>
              {quarterOptions.map((quarter) => (
                <option key={quarter} value={quarter}>
                  {quarter}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="pe-label">Primary Domain</span>
            <select
              className="pe-input w-full"
              value={domainFilter}
              onChange={(event) => setDomainFilter(event.target.value)}
            >
              <option value="all">All domains</option>
              {domainOptions.map((domain) => (
                <option key={domain} value={domain}>
                  {formatLabel(domain)}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="pe-label">Change Type</span>
            <select
              className="pe-input w-full"
              value={changeFilter}
              onChange={(event) => setChangeFilter(event.target.value)}
            >
              <option value="all">All change types</option>
              {changeOptions.map((change) => (
                <option key={change} value={change}>
                  {formatLabel(change)}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="pe-label">Concept Lens</span>
            <select
              className="pe-input w-full"
              value={conceptFilter}
              onChange={(event) => setConceptFilter(event.target.value)}
            >
              <option value="all">All concepts</option>
              {conceptOptions.map((concept) => (
                <option key={concept} value={concept}>
                  {formatLabel(concept)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <label className="space-y-2">
            <span className="pe-label">Milestone</span>
            <select
              className="pe-input w-full"
              value={milestoneFilter}
              onChange={(event) => setMilestoneFilter(event.target.value)}
            >
              <option value="all">All milestones</option>
              {milestoneOptions.map((milestone) => (
                <option key={milestone} value={milestone}>
                  {formatLabel(milestone)}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="pe-label">Topical Tag</span>
            <select
              className="pe-input w-full"
              value={tagFilter}
              onChange={(event) => setTagFilter(event.target.value)}
            >
              <option value="all">All topical tags</option>
              {tagOptions.map((tag) => (
                <option key={tag} value={tag}>
                  {formatLabel(tag)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              className="rounded-pe-element border border-pe-border-light bg-white px-4 py-3 text-sm font-medium text-pe-text-primary transition hover:border-pe-primary-500"
              onClick={() => {
                setSearch("");
                setRepoFilter("all");
                setQuarterFilter("all");
                setDomainFilter("all");
                setChangeFilter("all");
                setConceptFilter("all");
                setMilestoneFilter("all");
                setTagFilter("all");
              }}
              type="button"
            >
              Reset filters
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="pe-panel p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="pe-label">Category coverage</div>
              <h2 className="mt-2 text-2xl font-semibold text-pe-text-primary">
                What kinds of work dominate this slice?
              </h2>
            </div>
          </div>
          <div className="mt-6 h-[360px]">
            <ChartFrame hasMounted={hasMounted}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
                <BarChart
                  data={domainRows}
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
                    width={180}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f3f7f6" }} />
                  <Legend />
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
            </ChartFrame>
          </div>
        </article>

        <article className="pe-panel p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="pe-label">Monthly evolution</div>
              <h2 className="mt-2 text-2xl font-semibold text-pe-text-primary">
                When did this work cluster?
              </h2>
            </div>
            <div className="text-sm text-pe-text-secondary">
              {activeTimelineRows.length} months in stored timeline
            </div>
          </div>
          <div className="mt-6 h-[360px]">
            <ChartFrame hasMounted={hasMounted}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
                <BarChart data={monthRows} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d9e1e0" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f3f7f6" }} />
                  <Legend />
                  <Bar
                    dataKey="policyengineUs"
                    name="policyengine-us"
                    fill={colors.policyengineUs}
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="policyengineUsData"
                    name="policyengine-us-data"
                    fill={colors.policyengineUsData}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartFrame>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="pe-panel p-5 sm:p-6">
          <div className="pe-label">Tweetable milestones</div>
          <h2 className="mt-2 text-2xl font-semibold text-pe-text-primary">
            What concrete suites of changes are worth announcing?
          </h2>
          <div className="mt-6 grid gap-3">
            {(milestoneStorylines.length ? milestoneStorylines : overallMilestones).map(
              (storyline) => {
                const id = storyline.tag || storyline.id;
                return (
                  <button
                    key={id}
                    className="rounded-pe-container border border-pe-border-light bg-pe-gray-50/80 p-4 text-left transition hover:border-pe-primary-500"
                    onClick={() => setMilestoneFilter(id)}
                    type="button"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="font-semibold text-pe-text-primary">
                        {storyline.label || formatLabel(id)}
                      </div>
                      <div className="text-sm text-pe-text-secondary">
                        {storyline.count} matching changes
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-pe-text-secondary">
                      {storyline.tweet_angle || milestoneMetadata[id]?.tweet_angle}
                    </p>
                    <div className="mt-3 text-sm text-pe-text-secondary">
                      {storyline.firstMonth || storyline.first_month} to{" "}
                      {storyline.lastMonth || storyline.last_month}
                      {" · "}
                      peak in {storyline.peakMonth || storyline.peak_month}
                    </div>
                  </button>
                );
              },
            )}
          </div>
        </article>

        <article className="pe-panel p-5 sm:p-6">
          <div className="pe-label">Milestone detail</div>
          <h2 className="mt-2 text-2xl font-semibold text-pe-text-primary">
            Turn clusters into release notes or tweets
          </h2>

          {selectedMilestoneStoryline ? (
            <div className="mt-6 rounded-pe-container border border-pe-border-light bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,250,249,0.98))] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-lg font-semibold text-pe-text-primary">
                  {selectedMilestoneStoryline.label}
                </div>
                <div className="text-sm text-pe-text-secondary">
                  {selectedMilestoneStoryline.count} filtered changes
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-pe-text-secondary">
                {selectedMilestoneStoryline.description}
              </p>
              <div className="mt-4 rounded-pe-element border border-pe-border-light bg-white px-4 py-3 text-sm leading-6 text-pe-text-primary">
                {selectedMilestoneStoryline.tweet_angle}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedMilestoneStoryline.repos.map(([repo, count]) => (
                  <span key={repo} className="pe-chip">
                    {formatRepo(repo)}: {count}
                  </span>
                ))}
              </div>
              {selectedMilestoneStoryline.sampleTitles?.length ? (
                <div className="mt-4">
                  <div className="mb-2 text-sm font-semibold text-pe-text-primary">
                    Sample changes in this milestone
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedMilestoneStoryline.sampleTitles.map((title) => (
                      <span key={title} className="pe-chip">
                        {title}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6">
            <div className="mb-2 text-sm font-semibold text-pe-text-primary">
              Top milestones in this slice
            </div>
            <div className="flex flex-wrap gap-2">
              {topMilestones.map(([value, count]) => (
                <button
                  key={value}
                  className="pe-chip cursor-pointer hover:border-pe-primary-500"
                  onClick={() => setMilestoneFilter(value)}
                  type="button"
                >
                  {formatLabel(value)}: {count}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-pe-text-secondary">
            Milestones are deliberately more editorial than concepts. They group
            changes into announcement-ready arcs like national TANF coverage,
            district calibration, high-income realism, and calibration platform maturity.
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="pe-panel p-5 sm:p-6">
          <div className="pe-label">Concept lenses</div>
          <h2 className="mt-2 text-2xl font-semibold text-pe-text-primary">
            What deeper capabilities connect these changes?
          </h2>
          <div className="mt-6 grid gap-3">
            {conceptStorylines.map((storyline) => (
              <button
                key={storyline.tag}
                className="rounded-pe-container border border-pe-border-light bg-pe-gray-50/80 p-4 text-left transition hover:border-pe-primary-500"
                onClick={() => setConceptFilter(storyline.tag)}
                type="button"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="font-semibold text-pe-text-primary">
                    {formatLabel(storyline.tag)}
                  </div>
                  <div className="text-sm text-pe-text-secondary">
                    {storyline.count} matching changes
                  </div>
                </div>
                <div className="mt-2 text-sm leading-6 text-pe-text-secondary">
                  First seen {storyline.firstMonth}. Peak month {storyline.peakMonth}
                  {" "}
                  with {storyline.peakCount}. Last active {storyline.lastMonth}.
                </div>
                {storyline.sampleTitles.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {storyline.sampleTitles.map((title) => (
                      <span key={title} className="pe-chip">
                        {title}
                      </span>
                    ))}
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        </article>

        <article className="pe-panel p-5 sm:p-6">
          <div className="pe-label">Concept glossary</div>
          <h2 className="mt-2 text-2xl font-semibold text-pe-text-primary">
            Use concepts to navigate the year
          </h2>

          {selectedConceptStoryline ? (
            <div className="mt-6 rounded-pe-container border border-pe-border-light bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,250,249,0.98))] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-lg font-semibold text-pe-text-primary">
                  {formatLabel(selectedConceptStoryline.tag)}
                </div>
                <div className="text-sm text-pe-text-secondary">
                  {selectedConceptStoryline.count} filtered changes
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-pe-text-secondary">
                {CONCEPT_DETAILS[selectedConceptStoryline.tag] ||
                  "A higher-level analytical lens used to group related improvements."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedConceptStoryline.repos.map(([repo, count]) => (
                  <span key={repo} className="pe-chip">
                    {formatRepo(repo)}: {count}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6">
            <div className="mb-2 text-sm font-semibold text-pe-text-primary">
              Top concepts in this slice
            </div>
            <div className="flex flex-wrap gap-2">
              {topConcepts.map(([value, count]) => (
                <button
                  key={value}
                  className="pe-chip cursor-pointer hover:border-pe-primary-500"
                  onClick={() => setConceptFilter(value)}
                  type="button"
                >
                  {formatLabel(value)}: {count}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-pe-text-secondary">
            These concepts come from the richer narrative framing you supplied, so
            they are intended to capture capabilities like district-level targeting,
            state-aware imputation, top-end modeling, and pipeline maturity rather
            than narrow policy labels.
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="pe-panel p-5 sm:p-6">
          <div className="pe-label">Topical storylines</div>
          <h2 className="mt-2 text-2xl font-semibold text-pe-text-primary">
            What threads ran through the year?
          </h2>
          <div className="mt-6 grid gap-3">
            {storylines.map((storyline) => (
              <button
                key={storyline.tag}
                className="rounded-pe-container border border-pe-border-light bg-pe-gray-50/80 p-4 text-left transition hover:border-pe-primary-500"
                onClick={() => setTagFilter(storyline.tag)}
                type="button"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="font-semibold text-pe-text-primary">
                    {formatLabel(storyline.tag)}
                  </div>
                  <div className="text-sm text-pe-text-secondary">
                    {storyline.count} matching changes
                  </div>
                </div>
                <div className="mt-2 text-sm leading-6 text-pe-text-secondary">
                  First seen {storyline.firstMonth}. Peak month {storyline.peakMonth}
                  {" "}
                  with {storyline.peakCount}. Last active {storyline.lastMonth}.
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {storyline.repos.map(([repo, count]) => (
                    <span key={repo} className="pe-chip">
                      {formatRepo(repo)}: {count}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </article>

        <article className="pe-panel p-5 sm:p-6">
          <div className="pe-label">Taxonomy snapshot</div>
          <h2 className="mt-2 text-2xl font-semibold text-pe-text-primary">
            Drill deeper by category
          </h2>

          <div className="mt-6 space-y-5">
            <div>
              <div className="mb-2 text-sm font-semibold text-pe-text-primary">
                Top change types
              </div>
              <div className="flex flex-wrap gap-2">
                {topChangeTags.map(([value, count]) => (
                  <button
                    key={value}
                    className="pe-chip cursor-pointer hover:border-pe-primary-500"
                    onClick={() => setChangeFilter(value)}
                    type="button"
                  >
                    {formatLabel(value)}: {count}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-semibold text-pe-text-primary">
                Top concepts
              </div>
              <div className="flex flex-wrap gap-2">
                {topConcepts.map(([value, count]) => (
                  <button
                    key={value}
                    className="pe-chip cursor-pointer hover:border-pe-primary-500"
                    onClick={() => setConceptFilter(value)}
                    type="button"
                  >
                    {formatLabel(value)}: {count}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-semibold text-pe-text-primary">
                Top milestones
              </div>
              <div className="flex flex-wrap gap-2">
                {topMilestones.map(([value, count]) => (
                  <button
                    key={value}
                    className="pe-chip cursor-pointer hover:border-pe-primary-500"
                    onClick={() => setMilestoneFilter(value)}
                    type="button"
                  >
                    {formatLabel(value)}: {count}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-semibold text-pe-text-primary">
                Top themes
              </div>
              <div className="flex flex-wrap gap-2">
                {topThemes.map(([value, count]) => (
                  <span key={value} className="pe-chip">
                    {formatLabel(value)}: {count}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-semibold text-pe-text-primary">
                Top topical tags
              </div>
              <div className="flex flex-wrap gap-2">
                {topTags.map(([value, count]) => (
                  <button
                    key={value}
                    className="pe-chip cursor-pointer hover:border-pe-primary-500"
                    onClick={() => setTagFilter(value)}
                    type="button"
                  >
                    {formatLabel(value)}: {count}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </article>
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
            Stored summaries: domains, concepts, milestones, change types, topical storylines, and timeline rollups
          </div>
        </div>

        <div className="grid gap-4">
          {filteredItems.map((item) => {
            const visibleTopicalTags = item.topical_tags.filter((tag) => tag !== "other").slice(0, 4);
            const visibleChangeTags = item.change_tags.filter((tag) => tag !== "other").slice(0, 4);
            const visibleConceptTags = item.concept_tags.filter((tag) => tag !== "other").slice(0, 4);
            const visibleMilestoneTags = (item.milestone_tags || []).slice(0, 3);
            return (
              <article key={`${item.repo}-${item.sha}`} className="pe-panel p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-pe-text-secondary">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="pe-chip">{formatRepo(item.repo)}</span>
                    <button
                      className="pe-chip cursor-pointer hover:border-pe-primary-500"
                      onClick={() => setDomainFilter(item.primary_domain)}
                      type="button"
                    >
                      {formatLabel(item.primary_domain)}
                    </button>
                    <span>{item.date}</span>
                    <span>{item.quarter}</span>
                  </div>
                  <div className="text-pe-text-tertiary">
                    Theme: {formatLabel(item.primary_theme)}
                  </div>
                </div>

                <h3 className="mt-4 text-xl font-semibold text-pe-text-primary">
                  {item.resolved_title}
                </h3>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-pe-text-secondary">
                  {item.pr_summary || item.subject}
                </p>

                {visibleChangeTags.length ? (
                  <div className="mt-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-pe-text-tertiary">
                      Change tags
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {visibleChangeTags.map((tag) => (
                        <button
                          key={tag}
                          className="pe-chip cursor-pointer hover:border-pe-primary-500"
                          onClick={() => setChangeFilter(tag)}
                          type="button"
                        >
                          {formatLabel(tag)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {visibleConceptTags.length ? (
                  <div className="mt-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-pe-text-tertiary">
                      Concept lenses
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {visibleConceptTags.map((tag) => (
                        <button
                          key={tag}
                          className="pe-chip cursor-pointer hover:border-pe-primary-500"
                          onClick={() => setConceptFilter(tag)}
                          type="button"
                        >
                          {formatLabel(tag)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {visibleMilestoneTags.length ? (
                  <div className="mt-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-pe-text-tertiary">
                      Milestones
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {visibleMilestoneTags.map((tag) => (
                        <button
                          key={tag}
                          className="pe-chip cursor-pointer hover:border-pe-primary-500"
                          onClick={() => setMilestoneFilter(tag)}
                          type="button"
                        >
                          {formatLabel(tag)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {visibleTopicalTags.length ? (
                  <div className="mt-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-pe-text-tertiary">
                      Topical tags
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {visibleTopicalTags.map((tag) => (
                        <button
                          key={tag}
                          className="pe-chip cursor-pointer hover:border-pe-primary-500"
                          onClick={() => setTagFilter(tag)}
                          type="button"
                        >
                          {formatLabel(tag)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

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
            );
          })}
        </div>
      </section>
    </main>
  );
}

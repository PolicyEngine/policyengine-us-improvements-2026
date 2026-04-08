from __future__ import annotations

import json
import re
import subprocess
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
CACHE_DIR = DATA_DIR / "cache" / "prs"
CUTOFF = "2026-01-01"
PR_NUMBER_RE = re.compile(r"#(\d+)")


@dataclass(frozen=True)
class RepoConfig:
    name: str
    path: Path
    github_slug: str


REPOS = (
    RepoConfig(
        name="policyengine-us",
        path=Path("/Users/maxghenis/PolicyEngine/policyengine-us"),
        github_slug="PolicyEngine/policyengine-us",
    ),
    RepoConfig(
        name="policyengine-us-data",
        path=Path("/Users/maxghenis/PolicyEngine/policyengine-us-data"),
        github_slug="PolicyEngine/policyengine-us-data",
    ),
)


THEME_RULES = {
    "policyengine-us": (
        (
            "state_tax_and_legislation",
            (
                "income tax",
                "ctc",
                "eitc",
                "cdcc",
                "property tax",
                "surtax",
                "tax rebate",
                "capital gains",
                "alternative minimum tax",
                "same-category loss",
                "retirement exclusion",
                "tax update",
                "tax reform",
            ),
        ),
        (
            "state_benefits_and_childcare",
            (
                "tanf",
                "ccap",
                "ccdf",
                "child care",
                "school meals",
                "apple health",
                "chip",
                "medicaid",
                "cash assistance",
                "wic",
                "csfp",
                "liheap",
            ),
        ),
        (
            "federal_tax_and_retirement",
            (
                "payroll cap",
                "wage base",
                "social security",
                "401k",
                "catch-up",
                "self-employment",
                "se tax",
                "student loan",
                "pell grant",
                "head of household",
                "filer",
                "rrc",
                "actc",
                "ss credit",
                "microsimulation",
                "uprating",
            ),
        ),
        (
            "federal_benefits_and_health",
            (
                "aca",
                "snap",
                "slcsp",
                "medicare",
                "ssi",
                "pregnant",
                "immigration",
                "blind sga",
                "school meals",
                "health",
            ),
        ),
        (
            "geography_and_baseline_inputs",
            (
                "zip code",
                "county",
                "sldu",
                "sldl",
                "cbo baseline",
                "cpi projections",
            ),
        ),
        (
            "quality_tooling_and_docs",
            (
                "tests",
                "ruff",
                "black",
                "python 3.14",
                "coverage",
                "changelog",
                "documentation",
                "claude",
                "towncrier",
                "verified years",
            ),
        ),
    ),
    "policyengine-us-data": (
        (
            "calibration_pipeline",
            (
                "calibration",
                "targets",
                "database",
                "stc",
                "sanity tests",
                "household_weight",
            ),
        ),
        (
            "imputation_and_new_variables",
            (
                "impute",
                "imputation",
                "qrf",
                "sipp",
                "retirement",
                "liquid asset",
                "weeks_unemployed",
                "partnership_se_income",
                "tax filer",
                "pregnancy",
            ),
        ),
        (
            "takeup_and_participation",
            (
                "takeup",
                "take-up",
                "assignment",
                "reported recipients",
                "voluntary tax filer",
                "tanf",
                "aca override",
            ),
        ),
        (
            "geography_and_dataset_build",
            (
                "county",
                "census block",
                "stacked dataset",
                "lookup",
                "enhanced cps",
                "puf clone",
            ),
        ),
        (
            "validation_and_ci",
            (
                "validation",
                "test",
                "modal",
                "workflow",
                "ruff",
                "towncrier",
                "versioning",
                "publish",
                "pep 735",
            ),
        ),
    ),
}


THEME_TO_DOMAIN = {
    "state_tax_and_legislation": "state_tax_policy",
    "state_benefits_and_childcare": "benefits_and_childcare",
    "federal_tax_and_retirement": "federal_tax_policy",
    "federal_benefits_and_health": "health_and_safety_net",
    "geography_and_baseline_inputs": "geography_and_local_area",
    "quality_tooling_and_docs": "quality_tooling_and_docs",
    "calibration_pipeline": "calibration_and_data_pipeline",
    "imputation_and_new_variables": "calibration_and_data_pipeline",
    "takeup_and_participation": "calibration_and_data_pipeline",
    "geography_and_dataset_build": "geography_and_local_area",
    "validation_and_ci": "quality_tooling_and_docs",
    "other": "other",
}


CHANGE_TYPE_RULES = (
    (
        "new_coverage",
        (
            "add ",
            "implement ",
            "wire up",
            "introduce",
            "create ",
            "supporting all",
            "make the calibration database first class",
        ),
    ),
    (
        "annual_update",
        (
            "2025",
            "2026",
            "update cbo baseline",
            "update cpi projections",
            "update package version",
        ),
    ),
    (
        "reform_modeling",
        (
            "reform",
            "proposal",
            "hb",
            "sb",
            "act ",
            "bill ",
            "surtax",
            "rebate",
            "phase-out",
            "phaseout",
            "stay nj",
            "anchor",
        ),
    ),
    (
        "historical_backfill",
        (
            "backdate",
            "backfill",
            "historical",
            "pre-2018",
            "pre-2022",
            "2018-2024",
            "through 2100",
        ),
    ),
    (
        "bug_fix",
        (
            "fix ",
            "fixes ",
            "restore ",
            "correct ",
            "prevent ",
            "repair ",
            "explicit",
            "safety catch",
            "cap all",
        ),
    ),
    (
        "infrastructure",
        (
            "database",
            "pipeline",
            "workflow",
            "migrate",
            "switch from",
            "modal",
            "checkpoint",
            "cli",
            "publish",
            "package",
            "first class",
            "derive",
            "remove .claude submodule",
        ),
    ),
    (
        "testing_validation",
        (
            "test",
            "tests",
            "validation",
            "coverage",
            "lint",
            "sanity",
        ),
    ),
    (
        "performance",
        (
            "oom",
            "efficient",
            "memory",
            "half-sample",
        ),
    ),
    (
        "documentation",
        (
            "documentation",
            "guide",
            "readme",
            "changelog",
            "claude.md",
        ),
    ),
)


TOPICAL_TAG_RULES = (
    (
        "state_income_tax",
        (
            "income tax",
            "local income tax",
            "capital gains tax",
            "alternative minimum tax",
        ),
    ),
    (
        "property_tax_relief",
        (
            "property tax",
            "renters credit",
            "anchor",
            "stay nj",
            "senior freeze",
        ),
    ),
    (
        "ctc",
        (
            "ctc",
            "child tax credit",
            "actc",
            "recovery rebate",
        ),
    ),
    (
        "eitc",
        (
            "eitc",
            "earned income tax credit",
            "working families tax credit",
            "wftc",
        ),
    ),
    (
        "childcare",
        (
            "child care",
            "ccap",
            "ccdf",
            "cdcc",
            "childcare",
        ),
    ),
    (
        "tanf",
        (
            "tanf",
            "temporary family assistance",
            "temporary cash assistance",
            "cash assistance",
            "reach up",
            "wv works",
            "families first",
            "power program",
        ),
    ),
    (
        "aca",
        (
            "aca",
            "ptc",
            "slcsp",
            "marketplace",
            "premium tax credit",
        ),
    ),
    (
        "medicaid_chip",
        (
            "medicaid",
            "medi-cal",
            "chip",
            "apple health",
        ),
    ),
    (
        "snap_school_meals",
        (
            "snap",
            "school meals",
            "abawd",
            "wic",
            "csfp",
        ),
    ),
    (
        "social_security_retirement",
        (
            "social security",
            "ssi",
            "401k",
            "401(k)",
            "retirement",
            "payroll cap",
            "wage base",
            "nawi",
        ),
    ),
    (
        "filing_behavior",
        (
            "filer",
            "filing",
            "taxsim",
            "student loan",
            "head of household",
        ),
    ),
    (
        "geography_local_area",
        (
            "county",
            "zip code",
            "sldu",
            "sldl",
            "local area",
            "census block",
            "rating area",
        ),
    ),
    (
        "calibration",
        (
            "calibration",
            "targets",
            "constraints",
            "database",
        ),
    ),
    (
        "imputation",
        (
            "impute",
            "imputation",
            "qrf",
            "sipp",
            "puf clone",
            "enhanced cps",
            "liquid asset",
            "pregnancy",
        ),
    ),
    (
        "takeup",
        (
            "takeup",
            "take-up",
            "reported recipients",
            "voluntary tax filer",
        ),
    ),
    (
        "validation_tooling",
        (
            "validation",
            "coverage",
            "tests",
            "ruff",
            "towncrier",
            "workflow",
            "python 3.14",
            "documentation",
            "claude.md",
        ),
    ),
    (
        "long_run_projections",
        (
            "2100",
            "uprating",
            "nawi",
            "wage base",
            "cbo baseline",
            "cpi projections",
        ),
    ),
)


CONCEPT_RULES = (
    (
        "district_level_geography",
        (
            "congressional district",
            "congressional districts",
            "state legislative district",
            "state legislative districts",
            "sldu",
            "sldl",
            "at-large district",
            "census block",
            "block-level",
            "district naming",
            "p(county|cd)",
            "county|cd",
            "county assignment",
            "local area calibration",
            "county income tax",
            "three_digit_zip_code",
            "census stc",
        ),
    ),
    (
        "state_aware_imputation",
        (
            "state-aware imputation",
            "state aware imputation",
            "state_fips",
            "state fips",
            "state predictor",
            "source impute",
            "source_impute",
            "acs re-imputation",
            "regional variation",
            "cross-state variation",
            "hourly wage",
            "hourly wages",
            "org hourly wages",
            "outgoing rotation group",
        ),
    ),
    (
        "top_end_income_modeling",
        (
            "high-income tail",
            "agi ceiling",
            "max agi",
            "top 0.5%",
            "$400 million",
            "400 million",
            "$25 million",
            "25 million",
            "400m max agi",
            "$400m",
            "agi > $10m",
            "capital income predictors",
            "soi table 4.3",
            "granular high income brackets",
        ),
    ),
    (
        "census_block_assignment",
        (
            "clone_and_assign",
            "geographic clones",
            "clone-by-clone",
            "population-weighted",
            "population-weighted random sample",
            "county_assignment",
            "clone",
            "clones",
            "puf clone",
            "puf cloning",
            "double_geography_for_puf",
            "census block assignment",
            "census block sampling",
            "donation algorithm",
            "donor household",
            "donor households",
            "census block-level geographic assignment",
            "census-block-first calibration pipeline",
            "p(county|cd)",
            "county|cd",
        ),
    ),
    (
        "takeup_modeling",
        (
            "takeup",
            "take-up",
            "state-aware takeup",
            "takeup seeding",
            "rerandomize",
            "rerandomization",
            "seeded_rng",
            "name-based seeding",
            "salt parameter",
            "state-specific medicaid",
            "reported recipients",
            "participation",
        ),
    ),
    (
        "targets_database_and_schema",
        (
            "targets database",
            "calibration database",
            "field_valid_values",
            "policy_data.db",
            "target_overview",
            "human-readable overview",
            "distinct reform ids",
            "etl scripts",
            "database guide",
            "source field",
            "source values",
            "schema",
            "trigger",
            "triggers",
            "views",
            "consistency checks",
            "target loading",
            "stale calibration targets",
            "time_period from dataset",
            "calibration database build pipeline",
        ),
    ),
    (
        "calibration_target_expansion",
        (
            "pregnancy calibration",
            "retirement contributions",
            "ss reconciliation",
            "soi table 4.3",
            "outgoing rotation group",
            "hierarchical uprating",
            "uprating of targets",
            "reconciled to add up",
            "calibration targets",
            "target processing",
            "target config",
            "national targets",
            "aca ptc state multipliers",
            "filer count calibration targets",
            "irs soi",
        ),
    ),
    (
        "unified_national_calibration",
        (
            "national calibration",
            "us.h5",
            "unified_calibration",
            "unified_matrix_builder",
            "unified pipeline",
            "under one roof",
            "districts, states, and cities",
            "graded against the income",
            "calibration consolidation",
            "stacked dataset",
            "cps_2024.h5",
            "published h5 datasets",
            "enhanced_cps_2024.h5",
            "huggingface upload",
        ),
    ),
    (
        "modal_gpu_pipeline",
        (
            "gpu",
            "modal",
            "serverless flow",
            "50 workers",
            "restart a partially completed pipeline run",
            "intermediate artifacts",
            "volume staging",
            "checkpointing",
            "checkpoint",
            "build-only",
            "package-path",
            "pipeline fingerprint",
            "artifact validation",
            "h5 pipeline scaling",
            "oom",
            "model fitting",
            "hyperparameter cli",
            "modal ci",
        ),
    ),
    (
        "provenance_and_quality_gates",
        (
            "provenance",
            "run id",
            "data lineage",
            "sha256",
            "stale data",
            "unit vs integration tests",
            "quality gates",
            "staging",
            "promotion",
            "sanity checks",
            "validation scripts",
            "logs are saved",
            "hashes",
            "manifest validation",
            "deterministic country package",
            "end-to-end test",
            "corrupted dataset uploads",
            "upload validation",
            "sanity tests",
            "versioning workflow",
            "publish workflow",
        ),
    ),
    (
        "sample_reforms_and_trackers",
        (
            "sample reform",
            "sample reforms",
            "charitable deduction",
            "van hollen",
            "state legislative tracker",
            "legislative tracker",
            "state reforms",
            "working americans' tax cut act",
            "contributed reform",
            "tax proposal",
            "tax reform",
        ),
    ),
    (
        "policy_surface_expansion",
        (
            "tanf",
            "ccdf",
            "ssi state supplements",
            "liheap",
            "backdating",
            "adoption",
            "taxsim",
            "lwi",
            "jec",
            "crs",
            "opportunity insights",
            "policyengine.org/us/model",
        ),
    ),
)


CONCEPT_METADATA = {
    "district_level_geography": {
        "label": "District-Level Geography",
        "description": (
            "More granular geographic modeling through congressional districts, "
            "state legislative districts, census blocks, and block-derived crosswalks."
        ),
    },
    "state_aware_imputation": {
        "label": "State-Aware Imputation",
        "description": (
            "Using state and local geography signals to improve rent, real estate "
            "tax, wage, and other source imputations."
        ),
    },
    "top_end_income_modeling": {
        "label": "Top-End Income Modeling",
        "description": (
            "Better handling of ultra-high-income households, AGI ceilings, and "
            "high-bracket calibration or imputation."
        ),
    },
    "census_block_assignment": {
        "label": "Census-Block Assignment",
        "description": (
            "Assigning cloned or donor households to economically plausible census "
            "blocks and districts instead of flat cross-district replication."
        ),
    },
    "takeup_modeling": {
        "label": "Take-up Modeling",
        "description": (
            "State-aware take-up rates and seeded stochastic assignment for "
            "reproducible participation modeling."
        ),
    },
    "targets_database_and_schema": {
        "label": "Targets Database And Schema",
        "description": (
            "Turning calibration targets into a governed database with schema "
            "checks, views, metadata, and source tracking."
        ),
    },
    "calibration_target_expansion": {
        "label": "Calibration Target Expansion",
        "description": (
            "Adding new calibration targets, richer target processing, uprating, "
            "and reconciliation across geographic levels."
        ),
    },
    "unified_national_calibration": {
        "label": "Unified National Calibration",
        "description": (
            "Consolidating separate calibration artifacts into one national, "
            "multi-level calibration architecture."
        ),
    },
    "modal_gpu_pipeline": {
        "label": "Modal GPU Pipeline",
        "description": (
            "GPU-backed, serverless Modal workflows for fitting, publishing, "
            "checkpointing, and scaling the calibration build."
        ),
    },
    "provenance_and_quality_gates": {
        "label": "Provenance And Quality Gates",
        "description": (
            "Run IDs, hashes, staging or promotion, validation, and release gates "
            "around calibrated datasets."
        ),
    },
    "sample_reforms_and_trackers": {
        "label": "Sample Reforms And Trackers",
        "description": (
            "External-facing reform examples and tracker-style products that turn "
            "the model stack into narrative analysis."
        ),
    },
    "policy_surface_expansion": {
        "label": "Policy Surface Expansion",
        "description": (
            "New modeled programs, backdating work, and public-facing products "
            "built on top of the underlying model and data stack."
        ),
    },
}


def run(*args: str) -> str:
    return subprocess.check_output(args, text=True)


def run_json(*args: str) -> dict:
    return json.loads(run(*args))


def cache_path(repo: RepoConfig, pr_number: int) -> Path:
    return CACHE_DIR / repo.name / f"{pr_number}.json"


def ensure_dirs() -> None:
    (CACHE_DIR / "policyengine-us").mkdir(parents=True, exist_ok=True)
    (CACHE_DIR / "policyengine-us-data").mkdir(parents=True, exist_ok=True)


def normalize_summary(body: str) -> str:
    body = re.sub(r"\r\n?", "\n", body).strip()
    if not body:
        return ""
    lines = [line.strip() for line in body.splitlines() if line.strip()]
    if not lines:
        return ""
    return lines[0][:500]


def normalize_classification_text(*parts: str) -> str:
    text = "\n".join(part for part in parts if part).strip()
    if not text:
        return ""
    text = re.sub(r"\r\n?", "\n", text)
    text = re.sub(r"\s+", " ", text)
    return text[:12000]


def quarter_for_date(date: str) -> str:
    year, month, _day = date.split("-")
    quarter = (int(month) - 1) // 3 + 1
    return f"{year}-Q{quarter}"


def unique_preserve_order(values: list[str]) -> list[str]:
    output = []
    seen = set()
    for value in values:
        if value in seen:
            continue
        seen.add(value)
        output.append(value)
    return output


def classify_rules(
    text: str, rules: tuple[tuple[str, tuple[str, ...]], ...], default: str | None
) -> list[str]:
    lowered = text.lower()
    matches = [
        tag
        for tag, needles in rules
        if any(needle in lowered for needle in needles)
    ]
    matches = unique_preserve_order(matches)
    if not matches and default is not None:
        return [default]
    return matches


def fetch_pr(repo: RepoConfig, pr_number: int) -> dict:
    path = cache_path(repo, pr_number)
    if path.exists():
        return json.loads(path.read_text())

    pr = run_json("gh", "api", f"repos/{repo.github_slug}/pulls/{pr_number}")
    payload = {
        "number": pr["number"],
        "title": pr["title"],
        "body": pr.get("body") or "",
        "url": pr["html_url"],
        "merged_at": pr.get("merged_at"),
        "author": pr.get("user", {}).get("login"),
        "additions": pr.get("additions"),
        "deletions": pr.get("deletions"),
        "changed_files": pr.get("changed_files"),
    }
    path.write_text(json.dumps(payload, indent=2, sort_keys=True))
    return payload


def iter_commits(repo: RepoConfig) -> Iterable[dict]:
    output = run(
        "git",
        "-C",
        str(repo.path),
        "log",
        f"--since={CUTOFF}",
        "--date=short",
        "--pretty=format:%H\t%ad\t%s",
        "--first-parent",
    )
    for line in output.splitlines():
        sha, date, subject = line.split("\t", 2)
        pr_numbers = [int(value) for value in PR_NUMBER_RE.findall(subject)]
        yield {
            "repo": repo.name,
            "sha": sha,
            "date": date,
            "subject": subject,
            "pr_numbers": pr_numbers,
        }


def resolve_pr_data(commit: dict, pr_lookup: dict[int, dict]) -> dict:
    if commit["pr_numbers"]:
        pr = pr_lookup.get(commit["pr_numbers"][0])
        if pr:
            return {
                "resolved_title": pr["title"],
                "pr_summary": normalize_summary(pr["body"]),
                "pr_url": pr["url"],
                "pr_author": pr.get("author", ""),
                "pr_changed_files": pr.get("changed_files"),
            }
    return {
        "resolved_title": commit["subject"],
        "pr_summary": "",
        "pr_url": "",
        "pr_author": "",
        "pr_changed_files": None,
    }


def classify_themes(repo_name: str, text: str) -> list[str]:
    themes = classify_rules(text, THEME_RULES[repo_name], default="other")
    return themes


def pick_primary_theme(themes: list[str]) -> str:
    for theme in themes:
        if theme != "other":
            return theme
    return themes[0]


def is_noise(subject: str) -> bool:
    lowered = subject.lower()
    return lowered.startswith("update policyengine us") or lowered.startswith(
        "update package version"
    )


def build_repo_inventory(repo: RepoConfig) -> list[dict]:
    commits = list(iter_commits(repo))
    pr_numbers = sorted(
        {
            pr_number
            for commit in commits
            for pr_number in commit["pr_numbers"]
        }
    )
    pr_lookup = {}
    for pr_number in pr_numbers:
        try:
            pr_lookup[pr_number] = fetch_pr(repo, pr_number)
        except subprocess.CalledProcessError as error:
            print(f"warning: failed to fetch PR #{pr_number} for {repo.name}: {error}")

    inventory = []
    for commit in commits:
        pr_data = resolve_pr_data(commit, pr_lookup)
        pr_body = ""
        if commit["pr_numbers"]:
            pr_body = (pr_lookup.get(commit["pr_numbers"][0]) or {}).get("body", "")
        text_blob = normalize_classification_text(
            pr_data["resolved_title"],
            pr_body,
            pr_data["pr_summary"],
            commit["subject"],
        )
        themes = classify_themes(repo.name, text_blob)
        primary_theme = pick_primary_theme(themes)
        inventory.append(
            {
                **commit,
                **pr_data,
                "month": commit["date"][:7],
                "quarter": quarter_for_date(commit["date"]),
                "themes": themes,
                "primary_theme": primary_theme,
                "primary_domain": THEME_TO_DOMAIN[primary_theme],
                "change_tags": classify_rules(text_blob, CHANGE_TYPE_RULES, default="other"),
                "topical_tags": classify_rules(text_blob, TOPICAL_TAG_RULES, default="other"),
                "concept_tags": classify_rules(text_blob, CONCEPT_RULES, default="other"),
                "noise": is_noise(commit["subject"]),
            }
        )
    return inventory


def build_counter_summary(
    items: list[dict],
    field: str,
    *,
    multiple: bool,
    skip_values: set[str] | None = None,
) -> dict:
    skip_values = skip_values or set()
    by_repo = defaultdict(Counter)
    for item in items:
        if item["noise"]:
            continue
        raw_values = item[field] if multiple else [item[field]]
        for value in raw_values:
            if not value or value in skip_values:
                continue
            by_repo[item["repo"]][value] += 1

    return {
        repo_name: dict(counter.most_common())
        for repo_name, counter in by_repo.items()
    }


def build_theme_summary(inventory: list[dict]) -> dict:
    by_repo = defaultdict(lambda: defaultdict(Counter))
    for item in inventory:
        status = "noise" if item["noise"] else "signal"
        for theme in item["themes"]:
            by_repo[item["repo"]][status][theme] += 1

    output = {}
    for repo_name, buckets in by_repo.items():
        output[repo_name] = {
            "signal": dict(buckets["signal"].most_common()),
            "noise": dict(buckets["noise"].most_common()),
        }
    return output


def build_storylines_for_field(
    inventory: list[dict], field: str, *, skip_values: set[str] | None = None
) -> list[dict]:
    skip_values = skip_values or {"other"}
    by_tag = defaultdict(list)
    for item in inventory:
        if item["noise"]:
            continue
        for tag in item[field]:
            if tag in skip_values:
                continue
            by_tag[tag].append(item)

    storylines = []
    for tag, items in by_tag.items():
        month_counts = Counter(item["month"] for item in items)
        peak_count = max(month_counts.values())
        peak_month = min(
            month for month, count in month_counts.items() if count == peak_count
        )
        repo_counts = Counter(item["repo"] for item in items)
        theme_counts = Counter(item["primary_theme"] for item in items)
        change_counts = Counter(
            change_tag
            for item in items
            for change_tag in item["change_tags"]
            if change_tag != "other"
        )

        sample_titles = []
        seen_titles = set()
        for item in sorted(items, key=lambda value: (value["date"], value["resolved_title"])):
            title = item["resolved_title"]
            if title in seen_titles:
                continue
            seen_titles.add(title)
            sample_titles.append(title)
            if len(sample_titles) >= 5:
                break

        storylines.append(
            {
                "tag": tag,
                "count": len(items),
                "first_month": min(month_counts),
                "last_month": max(month_counts),
                "peak_month": peak_month,
                "peak_count": peak_count,
                "repos": dict(repo_counts.most_common()),
                "themes": dict(theme_counts.most_common(5)),
                "change_tags": dict(change_counts.most_common(5)),
                "sample_titles": sample_titles,
            }
        )

    return sorted(storylines, key=lambda value: (-value["count"], value["tag"]))


def build_storylines(inventory: list[dict]) -> list[dict]:
    return build_storylines_for_field(inventory, "topical_tags")


def build_concept_storylines(inventory: list[dict]) -> list[dict]:
    return build_storylines_for_field(inventory, "concept_tags")


def build_concept_cards(inventory: list[dict]) -> list[dict]:
    cards = []
    for storyline in build_concept_storylines(inventory):
        metadata = CONCEPT_METADATA[storyline["tag"]]
        cards.append(
            {
                "id": storyline["tag"],
                "label": metadata["label"],
                "description": metadata["description"],
                "count": storyline["count"],
                "first_month": storyline["first_month"],
                "last_month": storyline["last_month"],
                "peak_month": storyline["peak_month"],
                "peak_count": storyline["peak_count"],
                "repos": storyline["repos"],
                "sample_titles": storyline["sample_titles"],
            }
        )
    return cards


def build_timeline_summary(inventory: list[dict]) -> list[dict]:
    signal_items = [item for item in inventory if not item["noise"]]
    months = sorted({item["month"] for item in signal_items})
    output = []
    for month in months:
        month_items = [item for item in signal_items if item["month"] == month]
        output.append(
            {
                "month": month,
                "quarter": quarter_for_date(f"{month}-01"),
                "policyengine-us": sum(
                    1 for item in month_items if item["repo"] == "policyengine-us"
                ),
                "policyengine-us-data": sum(
                    1
                    for item in month_items
                    if item["repo"] == "policyengine-us-data"
                ),
                "domains": dict(
                    Counter(item["primary_domain"] for item in month_items).most_common()
                ),
                "themes": dict(
                    Counter(item["primary_theme"] for item in month_items).most_common()
                ),
                "change_tags": dict(
                    Counter(
                        tag
                        for item in month_items
                        for tag in item["change_tags"]
                        if tag != "other"
                    ).most_common(10)
                ),
                "topical_tags": dict(
                    Counter(
                        tag
                        for item in month_items
                        for tag in item["topical_tags"]
                        if tag != "other"
                    ).most_common(10)
                ),
                "concept_tags": dict(
                    Counter(
                        tag
                        for item in month_items
                        for tag in item["concept_tags"]
                        if tag != "other"
                    ).most_common(12)
                ),
            }
        )
    return output


def build_taxonomy_summary(inventory: list[dict]) -> dict:
    signal_items = [item for item in inventory if not item["noise"]]
    return {
        "domains": build_counter_summary(
            signal_items,
            "primary_domain",
            multiple=False,
        ),
        "themes": build_counter_summary(
            signal_items,
            "primary_theme",
            multiple=False,
        ),
        "change_tags": build_counter_summary(
            signal_items,
            "change_tags",
            multiple=True,
            skip_values={"other"},
        ),
        "topical_tags": build_counter_summary(
            signal_items,
            "topical_tags",
            multiple=True,
            skip_values={"other"},
        ),
        "concepts": build_counter_summary(
            signal_items,
            "concept_tags",
            multiple=True,
            skip_values={"other"},
        ),
        "quarters": build_counter_summary(
            signal_items,
            "quarter",
            multiple=False,
        ),
        "concept_cards": build_concept_cards(inventory),
        "storylines": build_storylines(inventory),
        "concept_storylines": build_concept_storylines(inventory),
    }


def main() -> None:
    ensure_dirs()
    inventory = []
    for repo in REPOS:
        inventory.extend(build_repo_inventory(repo))

    inventory.sort(key=lambda item: (item["date"], item["repo"], item["sha"]))

    commit_inventory_path = DATA_DIR / "commit_inventory.json"
    commit_inventory_path.parent.mkdir(parents=True, exist_ok=True)
    commit_inventory_path.write_text(json.dumps(inventory, indent=2))

    theme_summary = build_theme_summary(inventory)
    taxonomy_summary = build_taxonomy_summary(inventory)
    timeline_summary = build_timeline_summary(inventory)

    (DATA_DIR / "theme_summary.json").write_text(json.dumps(theme_summary, indent=2))
    (DATA_DIR / "taxonomy_summary.json").write_text(
        json.dumps(taxonomy_summary, indent=2)
    )
    (DATA_DIR / "timeline_summary.json").write_text(
        json.dumps(timeline_summary, indent=2)
    )

    print(f"wrote {commit_inventory_path}")
    print(f"wrote {DATA_DIR / 'theme_summary.json'}")
    print(f"wrote {DATA_DIR / 'taxonomy_summary.json'}")
    print(f"wrote {DATA_DIR / 'timeline_summary.json'}")


if __name__ == "__main__":
    main()

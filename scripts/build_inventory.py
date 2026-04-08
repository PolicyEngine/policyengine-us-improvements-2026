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
    summary = lines[0]
    return summary[:500]


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


def resolve_title(commit: dict, pr_lookup: dict[int, dict]) -> tuple[str, str, str]:
    if commit["pr_numbers"]:
        pr = pr_lookup.get(commit["pr_numbers"][0])
        if pr:
            return pr["title"], normalize_summary(pr["body"]), pr["url"]
    return commit["subject"], "", ""


def classify(repo_name: str, text: str) -> list[str]:
    lowered = text.lower()
    themes = []
    for theme, needles in THEME_RULES[repo_name]:
        if any(needle in lowered for needle in needles):
            themes.append(theme)
    if not themes:
        themes.append("other")
    return themes


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
        title, pr_summary, pr_url = resolve_title(commit, pr_lookup)
        inventory.append(
            {
                **commit,
                "resolved_title": title,
                "pr_summary": pr_summary,
                "pr_url": pr_url,
                "themes": classify(repo.name, f"{title}\n{pr_summary}\n{commit['subject']}"),
                "noise": is_noise(commit["subject"]),
            }
        )
    return inventory


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
    (DATA_DIR / "theme_summary.json").write_text(json.dumps(theme_summary, indent=2))

    print(f"wrote {commit_inventory_path}")
    print(f"wrote {DATA_DIR / 'theme_summary.json'}")


if __name__ == "__main__":
    main()

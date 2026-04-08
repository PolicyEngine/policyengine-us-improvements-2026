import { readFile } from "node:fs/promises";
import path from "node:path";
import DashboardClient from "@/components/dashboard-client";

export const dynamic = "force-dynamic";

async function loadJson(filename) {
  const filePath = path.join(process.cwd(), "data", filename);
  const contents = await readFile(filePath, "utf8");
  return JSON.parse(contents);
}

async function loadText(relativePath) {
  const filePath = path.join(process.cwd(), relativePath);
  return readFile(filePath, "utf8");
}

export default async function Page() {
  const [inventory, themeSummary, executiveSummary] = await Promise.all([
    loadJson("commit_inventory.json"),
    loadJson("theme_summary.json"),
    loadText("notes/executive-summary.md"),
  ]);

  return (
    <DashboardClient
      executiveSummary={executiveSummary}
      inventory={inventory}
      themeSummary={themeSummary}
    />
  );
}

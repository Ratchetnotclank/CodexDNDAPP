import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "website-data", "data");
const CLASS_DIR = path.join(DATA_DIR, "class");
const PREMADE_PATH = path.join(
  process.cwd(),
  "website-data",
  "premade-blocks",
  "npc_statblocks_compendium_2019.json"
);
const PREMADE_SOURCE = "NPC Statblocks Compendium 2019";
const PARSER_PATH = path.join(process.cwd(), "website-data", "js", "parser.js");

let cachedSourceLabels: Map<string, string> | null = null;

const SIZE_MAP: Record<string, string> = {
  T: "Tiny",
  S: "Small",
  M: "Medium",
  L: "Large",
  H: "Huge",
  G: "Gargantuan"
};

const SPEED_ORDER = ["walk", "fly", "climb", "swim", "burrow"];

function toTitleCase(value: string): string {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatSpeed(speed: unknown): string {
  if (typeof speed === "number") return `${speed} ft.`;
  if (!speed || typeof speed !== "object") return "";

  const parts: string[] = [];
  for (const key of SPEED_ORDER) {
    const value = (speed as Record<string, unknown>)[key];
    if (typeof value === "number") {
      parts.push(key === "walk" ? `${value} ft.` : `${key} ${value} ft.`);
    }
  }
  return parts.join(", ");
}

function formatLanguages(languages: unknown): string {
  if (!Array.isArray(languages)) return "";
  const parts: string[] = [];

  for (const entry of languages) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    for (const [key, value] of Object.entries(record)) {
      if (key === "anyStandard" && typeof value === "number") {
        parts.push(`any ${value} standard languages`);
      } else if (key === "any" && typeof value === "number") {
        parts.push(`any ${value} languages`);
      } else if (key === "choose" && value && typeof value === "object") {
        const choice = value as Record<string, unknown>;
        const from = Array.isArray(choice.from) ? choice.from.join(", ") : "";
        const count = typeof choice.count === "number" ? choice.count : 1;
        parts.push(`choose ${count} from ${from}`.trim());
      } else if (value === true) {
        parts.push(toTitleCase(key.replace(/_/g, " ")));
      }
    }
  }

  return parts.join(", ");
}

async function getSourceLabels(): Promise<Map<string, string>> {
  if (cachedSourceLabels) return cachedSourceLabels;

  const content = await fs.readFile(PARSER_PATH, "utf-8");
  const codeByConst = new Map<string, string>();

  const codeMatches = content.matchAll(
    /Parser\\.SRC_[A-Z0-9_]+\\s*=\\s*\"([^\"]+)\"/g
  );
  for (const match of codeMatches) {
    const constMatch = match[0].match(/Parser\\.(SRC_[A-Z0-9_]+)/);
    if (!constMatch) continue;
    codeByConst.set(constMatch[1], match[1]);
  }

  const labels = new Map<string, string>();
  const labelMatches = content.matchAll(
    /Parser\\.SOURCE_JSON_TO_FULL\\[Parser\\.(SRC_[A-Z0-9_]+)\\]\\s*=\\s*\"([^\"]+)\"/g
  );
  for (const match of labelMatches) {
    const code = codeByConst.get(match[1]);
    if (!code) continue;
    labels.set(code, match[2]);
  }

  labels.set(PREMADE_SOURCE, PREMADE_SOURCE);
  cachedSourceLabels = labels;
  return labels;
}

function buildSourceOptions(
  codes: string[],
  labels: Map<string, string>
): Array<{ code: string; label: string }> {
  return Array.from(new Set(codes))
    .sort((a, b) => a.localeCompare(b))
    .map((code) => ({ code, label: labels.get(code) ?? code }));
}

async function loadRaces() {
  const racesPath = path.join(DATA_DIR, "races.json");
  const data = JSON.parse(await fs.readFile(racesPath, "utf-8"));
  const sourceLabels = await getSourceLabels();
  const items = (data.race ?? []).map((race: Record<string, unknown>) => {
    const size = Array.isArray(race.size) ? race.size[0] : race.size;
    return {
      name: race.name as string,
      size: SIZE_MAP[String(size)] ?? "Medium",
      speed: formatSpeed(race.speed),
      languages: formatLanguages(race.languageProficiencies),
      creatureTypes: race.creatureTypes ?? ["humanoid"],
      darkvision: typeof race.darkvision === "number" ? race.darkvision : null,
      source: (race.source as string) ?? "Unknown"
    };
  });
  const sources = buildSourceOptions(
    items.map((item) => item.source),
    sourceLabels
  );
  return { items, sources };
}

async function loadClasses() {
  const entries = await fs.readdir(CLASS_DIR);
  const classes: Array<Record<string, unknown>> = [];
  const sourceLabels = await getSourceLabels();

  for (const entry of entries) {
    if (!entry.endsWith(".json")) continue;
    const filePath = path.join(CLASS_DIR, entry);
    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
    if (Array.isArray(data.class)) {
      classes.push(...data.class);
    }
  }

  const items = classes.map((cls) => ({
    name: cls.name as string,
    spellcastingAbility: (cls.spellcastingAbility as string) ?? null,
    startingProficiencies: cls.startingProficiencies ?? null,
    source: (cls.source as string) ?? "Unknown"
  }));
  const sources = buildSourceOptions(
    items.map((item) => item.source),
    sourceLabels
  );
  return { items, sources };
}

async function loadPremades() {
  const sourceLabels = await getSourceLabels();
  const data = JSON.parse(await fs.readFile(PREMADE_PATH, "utf-8"));
  const items = Array.isArray(data)
    ? data.map((item: Record<string, unknown>) => ({
        ...item,
        source: PREMADE_SOURCE
      }))
    : [];
  return {
    items,
    sources: buildSourceOptions([PREMADE_SOURCE], sourceLabels)
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    if (type === "races") {
      return NextResponse.json(await loadRaces());
    }
    if (type === "classes") {
      return NextResponse.json(await loadClasses());
    }
    if (type === "premades") {
      return NextResponse.json(await loadPremades());
    }

    return NextResponse.json({ error: "Unknown reference type" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load reference data" }, { status: 500 });
  }
}

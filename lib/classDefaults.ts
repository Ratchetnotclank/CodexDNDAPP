import type { AbilityScores } from "./types";

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

const CLASS_PRIORITY: Record<string, Array<keyof AbilityScores>> = {
  Artificer: ["int", "con", "dex"],
  Barbarian: ["str", "con", "dex"],
  Bard: ["cha", "dex", "con"],
  Cleric: ["wis", "con", "str"],
  Druid: ["wis", "con", "dex"],
  Fighter: ["str", "con", "dex"],
  Monk: ["dex", "wis", "con"],
  Paladin: ["str", "cha", "con"],
  Ranger: ["dex", "wis", "con"],
  Rogue: ["dex", "int", "con"],
  Sorcerer: ["cha", "con", "dex"],
  Warlock: ["cha", "con", "dex"],
  Wizard: ["int", "con", "dex"],
  Mystic: ["wis", "con", "dex"]
};

export function applyStandardArray(
  className: string,
  fallback: AbilityScores
): AbilityScores {
  const priority = CLASS_PRIORITY[className];
  if (!priority) return fallback;

  const remaining = ["str", "dex", "con", "int", "wis", "cha"].filter(
    (ability) => !priority.includes(ability as keyof AbilityScores)
  ) as Array<keyof AbilityScores>;

  const ordered = [...priority, ...remaining];
  const result: AbilityScores = { ...fallback };

  ordered.forEach((ability, index) => {
    result[ability] = STANDARD_ARRAY[index] ?? fallback[ability];
  });

  return result;
}

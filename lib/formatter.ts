import type { NPC } from "./types";
import { formatAbility } from "./utils";

const DIVIDER = "___";

function formatNamedEntries(entries: { name: string; description: string }[]): string {
  return entries
    .filter((entry) => entry.name.trim() && entry.description.trim())
    .map((entry) => `${entry.name}. ${entry.description}`)
    .join("\n");
}

export function formatStatblock(npc: NPC): string {
  const lines: string[] = [];

  lines.push(npc.name);
  lines.push(`${npc.size} ${npc.type}, ${npc.alignment}`);
  lines.push(DIVIDER);
  lines.push(`Armor Class ${npc.armorClass}`);

  const hpLine = npc.hitPoints.formula
    ? `Hit Points ${npc.hitPoints.average} (${npc.hitPoints.formula})`
    : `Hit Points ${npc.hitPoints.average}`;
  lines.push(hpLine);
  lines.push(`Speed ${npc.speed}`);
  lines.push(DIVIDER);
  lines.push("STR DEX CON INT WIS CHA");
  lines.push(
    [
      formatAbility(npc.abilities.str),
      formatAbility(npc.abilities.dex),
      formatAbility(npc.abilities.con),
      formatAbility(npc.abilities.int),
      formatAbility(npc.abilities.wis),
      formatAbility(npc.abilities.cha)
    ].join(" ")
  );
  lines.push(DIVIDER);

  if (npc.saves?.trim()) lines.push(`Saves ${npc.saves}`);
  if (npc.skills?.trim()) lines.push(`Skills ${npc.skills}`);
  if (npc.damageVulnerabilities?.trim())
    lines.push(`Damage Vulnerabilities ${npc.damageVulnerabilities}`);
  if (npc.damageResistances?.trim())
    lines.push(`Damage Resistances ${npc.damageResistances}`);
  if (npc.damageImmunities?.trim())
    lines.push(`Damage Immunities ${npc.damageImmunities}`);
  if (npc.conditionImmunities?.trim())
    lines.push(`Condition Immunities ${npc.conditionImmunities}`);
  if (npc.senses?.trim()) lines.push(`Senses ${npc.senses}`);
  if (npc.languages?.trim()) lines.push(`Languages ${npc.languages}`);
  if (npc.challengeRating?.trim()) lines.push(`Challenge ${npc.challengeRating}`);

  lines.push(DIVIDER);

  const traitsBlock = formatNamedEntries(npc.traits);
  if (traitsBlock) {
    lines.push(traitsBlock);
    lines.push("");
  }

  if (npc.spellcasting?.trim()) {
    lines.push(npc.spellcasting.trim());
    lines.push("");
  }

  lines.push("Actions");
  const actionsBlock = formatNamedEntries(npc.actions);
  if (actionsBlock) {
    lines.push(actionsBlock);
  }

  const bonusActionsBlock = formatNamedEntries(npc.bonusActions ?? []);
  if (bonusActionsBlock) {
    lines.push("");
    lines.push("Bonus Actions");
    lines.push(bonusActionsBlock);
  }

  const reactionsBlock = formatNamedEntries(npc.reactions ?? []);
  if (reactionsBlock) {
    lines.push("");
    lines.push("Reactions");
    lines.push(reactionsBlock);
  }

  return lines.join("\n").trim();
}

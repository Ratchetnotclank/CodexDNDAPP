import type { NPC } from "./types";
import { randomFrom } from "./utils";

const MERCHANT_NAMES = [
  "Alina Voss",
  "Bram Harker",
  "Cassia Thorn",
  "Dorian Hale",
  "Elira Marn",
  "Fenn Alder"
];

export function createHumanMerchant(): NPC {
  return {
    name: randomFrom(MERCHANT_NAMES),
    size: "Medium",
    type: "humanoid (human)",
    alignment: "neutral",
    armorClass: 12,
    hitPoints: {
      average: 9,
      formula: "2d8"
    },
    speed: "30 ft.",
    abilities: {
      str: 10,
      dex: 12,
      con: 10,
      int: 11,
      wis: 12,
      cha: 14
    },
    saves: "Wis +3",
    skills: "Insight +3, Persuasion +4",
    senses: "passive Perception 13",
    languages: "Common",
    challengeRating: "1/8",
    traits: [
      {
        name: "Shrewd Negotiator",
        description:
          "The merchant has advantage on Charisma (Persuasion) checks made to buy or sell goods."
      },
      {
        name: "Cautious",
        description:
          "The merchant can take the Disengage action as a bonus action once per day."
      }
    ],
    actions: [
      {
        name: "Dagger",
        description:
          "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d4 + 2) piercing damage."
      }
    ],
    spellcasting: ""
  };
}

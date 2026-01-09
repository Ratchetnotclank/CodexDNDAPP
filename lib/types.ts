export type AbilityScores = {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
};

export type NamedEntry = {
  name: string;
  description: string;
};

export type NPC = {
  name: string;
  size: "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan";
  type: string;
  alignment: string;
  armorClass: number;
  hitPoints: {
    average: number;
    formula?: string;
  };
  speed: string;
  abilities: AbilityScores;
  saves?: string;
  skills?: string;
  senses?: string;
  languages?: string;
  challengeRating: string;
  traits: NamedEntry[];
  actions: NamedEntry[];
  spellcasting?: string;
};

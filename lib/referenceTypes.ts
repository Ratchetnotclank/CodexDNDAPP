export type RaceOption = {
  name: string;
  size: string;
  speed: string;
  languages: string;
  creatureTypes: string[];
  darkvision: number | null;
};

export type ClassOption = {
  name: string;
  spellcastingAbility: string | null;
  startingProficiencies: {
    skills?: Array<{ choose?: { from: string[]; count: number } }>;
  } | null;
};

export type PremadeBlock = {
  name: string;
  size: string;
  type: string;
  alignment: string;
  armor_class: { value: number } | number;
  hit_points: { average: number; formula?: string };
  speed: Record<string, number> | number;
  abilities: Record<string, { score: number }>;
  saving_throws: string[] | null;
  skills: string[] | null;
  damage_vulnerabilities: string[] | null;
  damage_resistances: string[] | null;
  damage_immunities: string[] | null;
  condition_immunities: string[] | null;
  senses: string | null;
  languages: string | null;
  challenge: { cr: string } | string | null;
  traits: Array<{ name: string; text: string }> | null;
  actions: Array<{ name: string; text: string }> | null;
  bonus_actions: Array<{ name: string; text: string }> | null;
  reactions: Array<{ name: string; text: string }> | null;
};

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function formatAbility(score: number): string {
  return `${score} (${formatModifier(abilityModifier(score))})`;
}

export function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

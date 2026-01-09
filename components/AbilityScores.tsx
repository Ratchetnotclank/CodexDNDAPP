import type { AbilityScores } from "@/lib/types";

const ABILITY_LABELS: Array<keyof AbilityScores> = [
  "str",
  "dex",
  "con",
  "int",
  "wis",
  "cha"
];

type AbilityScoresProps = {
  values: AbilityScores;
  onChange: (next: AbilityScores) => void;
};

export default function AbilityScores({ values, onChange }: AbilityScoresProps) {
  const updateScore = (ability: keyof AbilityScores, value: string) => {
    const parsed = Number.parseInt(value, 10);
    const safeValue = Number.isNaN(parsed) ? 10 : parsed;
    onChange({ ...values, [ability]: safeValue });
  };

  return (
    <div className="row-tight">
      {ABILITY_LABELS.map((ability) => (
        <label key={ability}>
          {ability.toUpperCase()}
          <input
            type="number"
            min={1}
            value={values[ability]}
            onChange={(event) => updateScore(ability, event.target.value)}
          />
        </label>
      ))}
    </div>
  );
}

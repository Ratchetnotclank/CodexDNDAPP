"use client";

import { useEffect, useMemo, useState } from "react";
import AbilityScores from "@/components/AbilityScores";
import ListEditor from "@/components/ListEditor";
import Preview from "@/components/Preview";
import TextAreaField from "@/components/TextAreaField";
import TextField from "@/components/TextField";
import { createHumanMerchant } from "@/lib/archetypes";
import { applyStandardArray } from "@/lib/classDefaults";
import { formatStatblock } from "@/lib/formatter";
import type {
  ClassOption,
  PremadeBlock,
  RaceOption,
  ReferenceResponse
} from "@/lib/referenceTypes";
import type { NPC } from "@/lib/types";

const SPEED_ORDER = ["walk", "fly", "climb", "swim", "burrow"] as const;

const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"] as const;

function formatSpeedValue(speed: number | Record<string, number>): string {
  if (typeof speed === "number") return `${speed} ft.`;
  const parts: string[] = [];
  for (const key of SPEED_ORDER) {
    const value = speed[key];
    if (typeof value === "number") {
      parts.push(key === "walk" ? `${value} ft.` : `${key} ${value} ft.`);
    }
  }
  return parts.join(", ");
}

function mapPremadeToNpc(block: PremadeBlock): NPC {
  const armorClass =
    typeof block.armor_class === "number"
      ? block.armor_class
      : block.armor_class?.value ?? 10;
  const hitPoints = block.hit_points ?? { average: 1, formula: "" };
  const speed = formatSpeedValue(block.speed ?? 30);

  const abilities = ABILITY_KEYS.reduce(
    (acc, key) => ({
      ...acc,
      [key]: block.abilities?.[key]?.score ?? 10
    }),
    {} as NPC["abilities"]
  );

  return {
    name: block.name,
    size: block.size as NPC["size"],
    type: block.type,
    alignment: block.alignment,
    armorClass,
    hitPoints: {
      average: hitPoints.average ?? 1,
      formula: hitPoints.formula
    },
    speed,
    abilities,
    saves: block.saving_throws?.join(", ") ?? "",
    skills: block.skills?.join(", ") ?? "",
    senses: block.senses ?? "",
    languages: block.languages ?? "",
    damageVulnerabilities: block.damage_vulnerabilities?.join(", ") ?? "",
    damageResistances: block.damage_resistances?.join(", ") ?? "",
    damageImmunities: block.damage_immunities?.join(", ") ?? "",
    conditionImmunities: block.condition_immunities?.join(", ") ?? "",
    challengeRating:
      typeof block.challenge === "string"
        ? block.challenge
        : block.challenge?.cr ?? "",
    traits:
      block.traits?.map((trait) => ({
        name: trait.name,
        description: trait.text
      })) ?? [],
    actions:
      block.actions?.map((action) => ({
        name: action.name,
        description: action.text
      })) ?? [],
    bonusActions:
      block.bonus_actions?.map((action) => ({
        name: action.name,
        description: action.text
      })) ?? [],
    reactions:
      block.reactions?.map((action) => ({
        name: action.name,
        description: action.text
      })) ?? [],
    spellcasting: ""
  };
}

function formatClassSkillChoices(cls: ClassOption): string {
  const choices = cls.startingProficiencies?.skills;
  if (!choices || choices.length === 0) return "";
  const choice = choices[0]?.choose;
  if (!choice) return "";
  const from = choice.from.map((skill) =>
    skill
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
  return `Choose ${choice.count} from ${from.join(", ")}`;
}

function mergeDarkvision(current: string, darkvision: number | null): string {
  if (!darkvision) return current;
  const darkvisionText = `darkvision ${darkvision} ft.`;
  if (!current) return darkvisionText;
  if (current.toLowerCase().includes("darkvision")) return current;
  return `${darkvisionText}, ${current}`;
}

function buildTypeFromRace(raceName: string, creatureTypes: string[]): string {
  const baseType = creatureTypes[0] ?? "humanoid";
  return `${baseType} (${raceName.toLowerCase()})`;
}

const DEFAULT_NPC: NPC = {
  name: "New NPC",
  size: "Medium",
  race: "",
  class: "",
  type: "humanoid (human)",
  alignment: "neutral",
  armorClass: 10,
  hitPoints: {
    average: 4,
    formula: "1d8"
  },
  speed: "30 ft.",
  abilities: {
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10
  },
  saves: "",
  skills: "",
  senses: "passive Perception 10",
  languages: "Common",
  damageVulnerabilities: "",
  damageResistances: "",
  damageImmunities: "",
  conditionImmunities: "",
  challengeRating: "—",
  traits: [],
  actions: [],
  bonusActions: [],
  reactions: [],
  spellcasting: ""
};

export default function HomePage() {
  const [npc, setNpc] = useState<NPC>(DEFAULT_NPC);
  const [raceOptions, setRaceOptions] = useState<RaceOption[]>([]);
  const [classOptions, setClassOptions] = useState<ClassOption[]>([]);
  const [premadeBlocks, setPremadeBlocks] = useState<PremadeBlock[]>([]);
  const [sourceOptions, setSourceOptions] = useState<
    Array<{ code: string; label: string }>
  >([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedRace, setSelectedRace] = useState("Custom");
  const [selectedClass, setSelectedClass] = useState("Custom");
  const [selectedPremade, setSelectedPremade] = useState("Custom");
  const [autoApplyClassArray, setAutoApplyClassArray] = useState(true);
  const [customRace, setCustomRace] = useState("");
  const [customClass, setCustomClass] = useState("");
  const [lastSelectedRace, setLastSelectedRace] = useState<string | null>(null);
  const [lastSelectedClass, setLastSelectedClass] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("draft");
  const [status, setStatus] = useState<string>("");

  const previewText = useMemo(() => formatStatblock(npc), [npc]);
  const activeSourceSet = useMemo(
    () => new Set(selectedSources),
    [selectedSources]
  );
  const sourceLabelMap = useMemo(
    () => new Map(sourceOptions.map((source) => [source.code, source.label])),
    [sourceOptions]
  );
  const filteredRaceOptions = useMemo(
    () =>
      raceOptions.filter(
        (option) =>
          selectedSources.length === 0 || activeSourceSet.has(option.source)
      ),
    [raceOptions, activeSourceSet, selectedSources.length]
  );
  const filteredClassOptions = useMemo(
    () =>
      classOptions.filter(
        (option) =>
          selectedSources.length === 0 || activeSourceSet.has(option.source)
      ),
    [classOptions, activeSourceSet, selectedSources.length]
  );
  const filteredPremadeBlocks = useMemo(
    () =>
      premadeBlocks.filter(
        (block) =>
          selectedSources.length === 0 || activeSourceSet.has(block.source)
      ),
    [premadeBlocks, activeSourceSet, selectedSources.length]
  );

  const updateNpc = (updates: Partial<NPC>) => {
    setNpc((current) => ({ ...current, ...updates }));
  };

  const updateHitPoints = (updates: Partial<NPC["hitPoints"]>) => {
    setNpc((current) => ({
      ...current,
      hitPoints: { ...current.hitPoints, ...updates }
    }));
  };

  const handleSourceToggle = (source: string) => {
    setSelectedSources((current) =>
      current.includes(source)
        ? current.filter((item) => item !== source)
        : [...current, source]
    );
  };

  const handleSourceSelectAll = (checked: boolean) => {
    setSelectedSources(checked ? sourceOptions.map((opt) => opt.code) : []);
  };

  const handleRaceSelect = (value: string) => {
    setSelectedRace(value);
    if (value === "Custom") {
      const nextCustom = customRace || npc.race || "";
      setCustomRace(nextCustom);
      updateNpc({ race: nextCustom });
      return;
    }
    const race = raceOptions.find((option) => option.name === value);
    if (!race) return;

    setLastSelectedRace(value);
    updateNpc({
      race: race.name,
      size: race.size as NPC["size"],
      speed: race.speed || npc.speed,
      languages: race.languages || npc.languages,
      senses: mergeDarkvision(npc.senses ?? "", race.darkvision),
      type: buildTypeFromRace(race.name, race.creatureTypes)
    });
  };

  const handleClassSelect = (value: string) => {
    setSelectedClass(value);
    if (value === "Custom") {
      const nextCustom = customClass || npc.class || "";
      setCustomClass(nextCustom);
      updateNpc({ class: nextCustom });
      return;
    }
    const cls = classOptions.find((option) => option.name === value);
    if (!cls) return;

    setLastSelectedClass(value);
    setNpc((current) => ({
      ...current,
      class: cls.name,
      skills: formatClassSkillChoices(cls) || current.skills,
      abilities: autoApplyClassArray
        ? applyStandardArray(cls.name, current.abilities)
        : current.abilities
    }));
  };

  const handlePremadeSelect = (value: string) => {
    setSelectedPremade(value);
    if (value === "Custom") return;
    const premade = premadeBlocks.find((block) => block.name === value);
    if (!premade) return;
    setNpc(mapPremadeToNpc(premade));
  };

  useEffect(() => {
    let active = true;
    const loadReferences = async () => {
      try {
        const [racesResponse, classesResponse, premadesResponse] =
          await Promise.all([
            fetch("/api/reference?type=races"),
            fetch("/api/reference?type=classes"),
            fetch("/api/reference?type=premades")
          ]);

        if (!active) return;
        let raceSources: Array<{ code: string; label: string }> = [];
        let classSources: Array<{ code: string; label: string }> = [];
        let premadeSources: Array<{ code: string; label: string }> = [];

        if (racesResponse.ok) {
          const data =
            (await racesResponse.json()) as ReferenceResponse<RaceOption>;
          setRaceOptions(
            data.items.sort((a, b) => a.name.localeCompare(b.name))
          );
          raceSources = data.sources;
        }
        if (classesResponse.ok) {
          const data =
            (await classesResponse.json()) as ReferenceResponse<ClassOption>;
          setClassOptions(
            data.items.sort((a, b) => a.name.localeCompare(b.name))
          );
          classSources = data.sources;
        }
        if (premadesResponse.ok) {
          const data =
            (await premadesResponse.json()) as ReferenceResponse<PremadeBlock>;
          setPremadeBlocks(data.items);
          premadeSources = data.sources;
        }

        const merged = new Map<string, string>();
        [...raceSources, ...classSources, ...premadeSources].forEach((source) =>
          merged.set(source.code, source.label)
        );
        const combinedSources = Array.from(merged.entries())
          .map(([code, label]) => ({ code, label }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setSourceOptions(combinedSources);
        setSelectedSources(combinedSources.map((source) => source.code));
      } catch (error) {
        setStatus("Failed to load reference data.");
      }
    };

    loadReferences();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const raceMatch = raceOptions.some((option) => option.name === npc.race);
    if (raceMatch) {
      setSelectedRace(npc.race ?? "Custom");
    } else {
      setSelectedRace("Custom");
      setCustomRace(npc.race ?? "");
    }
  }, [npc.race, raceOptions]);

  useEffect(() => {
    const classMatch = classOptions.some((option) => option.name === npc.class);
    if (classMatch) {
      setSelectedClass(npc.class ?? "Custom");
    } else {
      setSelectedClass("Custom");
      setCustomClass(npc.class ?? "");
    }
  }, [npc.class, classOptions]);

  useEffect(() => {
    if (!autoApplyClassArray || selectedClass === "Custom") return;
    const cls = classOptions.find((option) => option.name === selectedClass);
    if (!cls) return;
    setNpc((current) => ({
      ...current,
      abilities: applyStandardArray(cls.name, current.abilities)
    }));
  }, [autoApplyClassArray, classOptions, selectedClass]);

  const handleCopy = async () => {
    setStatus("");
    try {
      await navigator.clipboard.writeText(previewText);
      setStatus("Copied to clipboard.");
    } catch (error) {
      setStatus("Clipboard copy failed. Your browser may block it.");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([previewText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${npc.name || "statblock"}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("Downloaded statblock.");
  };

  const handleSaveDraft = async () => {
    setStatus("");
    try {
      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: draftName, npc })
      });
      if (!response.ok) throw new Error("Save failed");
      setStatus("Draft saved.");
    } catch (error) {
      setStatus("Draft save failed.");
    }
  };

  const handleLoadDraft = async () => {
    setStatus("");
    try {
      const response = await fetch(`/api/drafts?name=${draftName}`);
      if (!response.ok) throw new Error("Load failed");
      const data = (await response.json()) as NPC;
      setNpc(data);
      setSelectedPremade("Custom");
      setStatus("Draft loaded.");
    } catch (error) {
      setStatus("Draft load failed.");
    }
  };

  return (
    <main>
      <h1>DnD Statblock Builder</h1>
      <p>Build a 5e NPC statblock and export it for Foundry import.</p>

      <section className="panel" style={{ marginBottom: 24 }}>
        <div className="section">
          <strong>Source Filters</strong>
          {sourceOptions.length === 0 ? (
            <div className="muted">No source metadata loaded yet.</div>
          ) : (
            <>
              <label style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input
                  type="checkbox"
                  checked={selectedSources.length === sourceOptions.length}
                  onChange={(event) =>
                    handleSourceSelectAll(event.target.checked)
                  }
                />
                Select all sources
              </label>
              <div className="source-grid" style={{ marginTop: 8 }}>
                {sourceOptions.map((source) => (
                  <label key={source.code} className="source-item">
                    <input
                      type="checkbox"
                      checked={selectedSources.includes(source.code)}
                      onChange={() => handleSourceToggle(source.code)}
                    />
                    <span>{source.label}</span>
                    {source.label !== source.code && (
                      <span className="muted">({source.code})</span>
                    )}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <div className="layout">
        <section className="panel">
          <div className="section">
            <div className="button-row">
              <button type="button" onClick={() => setNpc(createHumanMerchant())}>
                Generate Random NPC (Human Merchant)
              </button>
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <label>
                Premade Statblock
                <select
                  value={selectedPremade}
                  onChange={(event) => handlePremadeSelect(event.target.value)}
                >
                  <option value="Custom">Custom</option>
                  {filteredPremadeBlocks.map((block) => (
                    <option key={block.name} value={block.name}>
                      {block.name} ({sourceLabelMap.get(block.source) ?? block.source})
                    </option>
                  ))}
                </select>
              </label>
              {filteredPremadeBlocks.length === 0 && selectedSources.length > 0 && (
                <div className="muted">No premades match selected sources.</div>
              )}
            </div>
          </div>

          <div className="section">
            <div className="row">
              <TextField
                label="Name"
                value={npc.name}
                onChange={(value) => updateNpc({ name: value })}
              />
              {selectedRace === "Custom" ? (
                <div>
                  <TextField
                    label="Race"
                    value={customRace}
                    onChange={(value) => {
                      setCustomRace(value);
                      updateNpc({ race: value });
                    }}
                  />
                  <button
                    type="button"
                    className="secondary"
                    style={{ marginTop: 6 }}
                    onClick={() => {
                      const fallback =
                        lastSelectedRace ?? filteredRaceOptions[0]?.name ?? "Custom";
                      handleRaceSelect(fallback);
                    }}
                  >
                    Use list
                  </button>
                </div>
              ) : (
                <div>
                  <label>
                    Race
                    <select
                      value={selectedRace}
                      onChange={(event) => handleRaceSelect(event.target.value)}
                    >
                      <option value="Custom">Custom</option>
                      {filteredRaceOptions.map((race) => (
                        <option key={race.name} value={race.name}>
                          {race.name} ({sourceLabelMap.get(race.source) ?? race.source})
                        </option>
                      ))}
                    </select>
                  </label>
                  {filteredRaceOptions.length === 0 &&
                    selectedSources.length > 0 && (
                      <div className="muted">
                        No races match selected sources.
                      </div>
                    )}
                  <button
                    type="button"
                    className="secondary"
                    style={{ marginTop: 6 }}
                    onClick={() => handleRaceSelect("Custom")}
                  >
                    Custom
                  </button>
                </div>
              )}
              {selectedClass === "Custom" ? (
                <div>
                  <TextField
                    label="Class"
                    value={customClass}
                    onChange={(value) => {
                      setCustomClass(value);
                      updateNpc({ class: value });
                    }}
                  />
                  <button
                    type="button"
                    className="secondary"
                    style={{ marginTop: 6 }}
                    onClick={() => {
                      const fallback =
                        lastSelectedClass ?? filteredClassOptions[0]?.name ?? "Custom";
                      handleClassSelect(fallback);
                    }}
                  >
                    Use list
                  </button>
                </div>
              ) : (
                <div>
                  <label>
                    Class
                    <select
                      value={selectedClass}
                      onChange={(event) => handleClassSelect(event.target.value)}
                    >
                      <option value="Custom">Custom</option>
                      {filteredClassOptions.map((cls) => (
                        <option key={cls.name} value={cls.name}>
                          {cls.name} ({sourceLabelMap.get(cls.source) ?? cls.source})
                        </option>
                      ))}
                    </select>
                  </label>
                  {filteredClassOptions.length === 0 &&
                    selectedSources.length > 0 && (
                      <div className="muted">
                        No classes match selected sources.
                      </div>
                    )}
                  <button
                    type="button"
                    className="secondary"
                    style={{ marginTop: 6 }}
                    onClick={() => handleClassSelect("Custom")}
                  >
                    Custom
                  </button>
                </div>
              )}
              <TextField
                label="Alignment"
                value={npc.alignment}
                onChange={(value) => updateNpc({ alignment: value })}
              />
              <label>
                Size
                <select
                  value={npc.size}
                  onChange={(event) =>
                    updateNpc({ size: event.target.value as NPC["size"] })
                  }
                >
                  <option value="Tiny">Tiny</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="Huge">Huge</option>
                  <option value="Gargantuan">Gargantuan</option>
                </select>
              </label>
              <TextField
                label="Type"
                value={npc.type}
                onChange={(value) => updateNpc({ type: value })}
              />
            </div>
            <div className="muted" style={{ marginTop: 8 }}>
              Race and class selections can auto-fill size, speed, languages, and
              ability scores.
            </div>
          </div>

          <div className="section">
            <div className="row">
              <TextField
                label="Armor Class"
                value={npc.armorClass}
                type="number"
                min={1}
                onChange={(value) =>
                  updateNpc({ armorClass: Number.parseInt(value, 10) || 10 })
                }
              />
              <TextField
                label="Hit Points"
                value={npc.hitPoints.average}
                type="number"
                min={1}
                onChange={(value) =>
                  updateHitPoints({
                    average: Number.parseInt(value, 10) || 1
                  })
                }
              />
              <TextField
                label="HP Formula"
                value={npc.hitPoints.formula ?? ""}
                onChange={(value) => updateHitPoints({ formula: value })}
              />
              <TextField
                label="Speed"
                value={npc.speed}
                onChange={(value) => updateNpc({ speed: value })}
              />
            </div>
          </div>

          <div className="section">
            <strong>Ability Scores</strong>
            <AbilityScores
              values={npc.abilities}
              onChange={(value) => updateNpc({ abilities: value })}
            />
            <label style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input
                type="checkbox"
                checked={autoApplyClassArray}
                onChange={(event) => setAutoApplyClassArray(event.target.checked)}
              />
              Auto-apply standard array when selecting a class
            </label>
          </div>

          <div className="section">
            <div className="row">
              <TextField
                label="Saves"
                value={npc.saves ?? ""}
                onChange={(value) => updateNpc({ saves: value })}
              />
              <TextField
                label="Skills"
                value={npc.skills ?? ""}
                onChange={(value) => updateNpc({ skills: value })}
              />
              <TextField
                label="Senses"
                value={npc.senses ?? ""}
                onChange={(value) => updateNpc({ senses: value })}
              />
              <TextField
                label="Languages"
                value={npc.languages ?? ""}
                onChange={(value) => updateNpc({ languages: value })}
              />
              <TextField
                label="Challenge"
                value={npc.challengeRating}
                onChange={(value) => updateNpc({ challengeRating: value })}
              />
            </div>
          </div>

          <div className="section">
            <div className="row">
              <TextField
                label="Damage Vulnerabilities"
                value={npc.damageVulnerabilities ?? ""}
                onChange={(value) =>
                  updateNpc({ damageVulnerabilities: value })
                }
              />
              <TextField
                label="Damage Resistances"
                value={npc.damageResistances ?? ""}
                onChange={(value) => updateNpc({ damageResistances: value })}
              />
              <TextField
                label="Damage Immunities"
                value={npc.damageImmunities ?? ""}
                onChange={(value) => updateNpc({ damageImmunities: value })}
              />
              <TextField
                label="Condition Immunities"
                value={npc.conditionImmunities ?? ""}
                onChange={(value) => updateNpc({ conditionImmunities: value })}
              />
            </div>
          </div>

          <div className="section">
            <ListEditor
              label="Traits"
              items={npc.traits}
              onChange={(items) => updateNpc({ traits: items })}
            />
          </div>

          <div className="section">
            <ListEditor
              label="Actions"
              items={npc.actions}
              onChange={(items) => updateNpc({ actions: items })}
            />
          </div>

          <div className="section">
            <ListEditor
              label="Bonus Actions"
              items={npc.bonusActions ?? []}
              onChange={(items) => updateNpc({ bonusActions: items })}
            />
          </div>

          <div className="section">
            <ListEditor
              label="Reactions"
              items={npc.reactions ?? []}
              onChange={(items) => updateNpc({ reactions: items })}
            />
          </div>

          <div className="section">
            <TextAreaField
              label="Spellcasting"
              value={npc.spellcasting ?? ""}
              onChange={(value) => updateNpc({ spellcasting: value })}
              placeholder="Optional spellcasting block."
            />
          </div>

          <div className="section">
            <div className="row">
              <TextField
                label="Draft Name"
                value={draftName}
                onChange={(value) => setDraftName(value)}
              />
            </div>
            <div className="button-row" style={{ marginTop: 10 }}>
              <button type="button" className="secondary" onClick={handleSaveDraft}>
                Save Draft
              </button>
              <button type="button" className="secondary" onClick={handleLoadDraft}>
                Load Draft
              </button>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="section">
            <div className="button-row">
              <button type="button" onClick={handleCopy}>
                Copy to Clipboard
              </button>
              <button type="button" className="secondary" onClick={handleDownload}>
                Download .txt
              </button>
            </div>
            {status && <div className="muted">{status}</div>}
          </div>
          <Preview text={previewText} />
        </section>
      </div>
    </main>
  );
}

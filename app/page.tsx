"use client";

import { useMemo, useState } from "react";
import AbilityScores from "@/components/AbilityScores";
import ListEditor from "@/components/ListEditor";
import Preview from "@/components/Preview";
import TextAreaField from "@/components/TextAreaField";
import TextField from "@/components/TextField";
import { createHumanMerchant } from "@/lib/archetypes";
import { formatStatblock } from "@/lib/formatter";
import type { NPC } from "@/lib/types";

const DEFAULT_NPC: NPC = {
  name: "New NPC",
  size: "Medium",
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
  challengeRating: "—",
  traits: [],
  actions: [],
  spellcasting: ""
};

export default function HomePage() {
  const [npc, setNpc] = useState<NPC>(DEFAULT_NPC);
  const [draftName, setDraftName] = useState("draft");
  const [status, setStatus] = useState<string>("");

  const previewText = useMemo(() => formatStatblock(npc), [npc]);

  const updateNpc = (updates: Partial<NPC>) => {
    setNpc((current) => ({ ...current, ...updates }));
  };

  const updateHitPoints = (updates: Partial<NPC["hitPoints"]>) => {
    setNpc((current) => ({
      ...current,
      hitPoints: { ...current.hitPoints, ...updates }
    }));
  };

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
      setStatus("Draft loaded.");
    } catch (error) {
      setStatus("Draft load failed.");
    }
  };

  return (
    <main>
      <h1>DnD Statblock Builder</h1>
      <p>Build a 5e NPC statblock and export it for Foundry import.</p>

      <div className="layout">
        <section className="panel">
          <div className="section">
            <div className="button-row">
              <button type="button" onClick={() => setNpc(createHumanMerchant())}>
                Generate Random NPC (Human Merchant)
              </button>
            </div>
          </div>

          <div className="section">
            <div className="row">
              <TextField
                label="Name"
                value={npc.name}
                onChange={(value) => updateNpc({ name: value })}
              />
              <TextField
                label="Type"
                value={npc.type}
                onChange={(value) => updateNpc({ type: value })}
              />
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

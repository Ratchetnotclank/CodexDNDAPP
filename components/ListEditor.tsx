import type { NamedEntry } from "@/lib/types";
import TextAreaField from "./TextAreaField";
import TextField from "./TextField";

type ListEditorProps = {
  label: string;
  items: NamedEntry[];
  onChange: (next: NamedEntry[]) => void;
};

export default function ListEditor({ label, items, onChange }: ListEditorProps) {
  const updateItem = (index: number, field: keyof NamedEntry, value: string) => {
    const next = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(next);
  };

  const addItem = () => {
    onChange([...items, { name: "", description: "" }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="button-row" style={{ marginBottom: 8 }}>
        <strong>{label}</strong>
        <button type="button" className="secondary" onClick={addItem}>
          Add
        </button>
      </div>
      {items.map((item, index) => (
        <div className="list-item" key={`${label}-${index}`}>
          <TextField
            label="Name"
            value={item.name}
            onChange={(value) => updateItem(index, "name", value)}
          />
          <TextAreaField
            label="Description"
            value={item.description}
            onChange={(value) => updateItem(index, "description", value)}
          />
          <div style={{ paddingTop: 24 }}>
            <button
              type="button"
              className="secondary"
              onClick={() => removeItem(index)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div className="muted">No entries yet.</div>
      )}
    </div>
  );
}

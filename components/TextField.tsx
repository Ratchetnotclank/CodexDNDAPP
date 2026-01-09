type TextFieldProps = {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number";
  min?: number;
};

export default function TextField({
  label,
  value,
  onChange,
  type = "text",
  min
}: TextFieldProps) {
  return (
    <div>
      <label>
        {label}
        <input
          type={type}
          value={value}
          min={min}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    </div>
  );
}

type TextAreaFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function TextAreaField({
  label,
  value,
  onChange,
  placeholder
}: TextAreaFieldProps) {
  return (
    <div>
      <label>
        {label}
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    </div>
  );
}

interface Option<T extends string> {
  value: T;
  label: string;
}

interface TuningOptionGroupProps<T extends string> {
  label: string;
  options: Array<Option<T>>;
  value: T;
  onChange: (value: T) => void;
}

/** Groupe de boutons façon segmented-control, réutilisé par les assistants de tuning. */
export function TuningOptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: TuningOptionGroupProps<T>) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="mode-toggle">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`mode-toggle__btn ${value === o.value ? "mode-toggle__btn--active" : ""}`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </label>
  );
}

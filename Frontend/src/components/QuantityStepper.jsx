import { useEffect, useState } from "react";

export default function QuantityStepper({ value, max, onChange, disabled }) {
  const [draft, setDraft] = useState(String(value));

  const commit = () => {
    const n = Number(draft);
    if (!Number.isInteger(n) || n < 1 || max < 1)
      return setDraft(String(value));
    const next = Math.min(n, max);
    setDraft(String(next));
    if (next !== value) onChange(next);
  };
  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  return (
    <div className="inline-flex items-center border rounded bg-white">
      <button
        type="button"
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
        className="w-8 h-8 disabled:opacity-40"
      >
        −
      </button>
      <input
        value={draft}
        disabled={disabled}
        inputMode="numeric"
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className="w-12 h-8 text-center outline-none border-x"
      />
      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        className="w-8 h-8 disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}

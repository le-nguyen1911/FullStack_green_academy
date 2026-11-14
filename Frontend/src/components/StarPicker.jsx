import { useState } from "react";

export default function StarPicker({ value, onChange, disabled }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={disabled}
          aria-label={`${i} sao`}
          onMouseEnter={() => setHover(i)}
          onClick={() => onChange(i)}
          className={`text-3xl leading-none ${i <= shown ? "text-yellow-500" : "text-stone-300"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

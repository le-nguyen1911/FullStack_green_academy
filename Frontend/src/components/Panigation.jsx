const buildPages = (page, total) => {
  const set = new Set([1, total, page - 1, page, page + 1]);
  const nums = [...set]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
};

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-1 mt-8">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="px-3 h-9 border rounded bg-white disabled:opacity-40"
      >
        ‹
      </button>
      {buildPages(page, totalPages).map((n, i) =>
        n === "…" ? (
          <span key={`d${i}`} className="px-2 text-stone-400">
            …
          </span>
        ) : (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`w-9 h-9 border rounded ${n === page ? "bg-amber-900 text-white" : "bg-white"}`}
          >
            {n}
          </button>
        ),
      )}
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="px-3 h-9 border rounded bg-white disabled:opacity-40"
      >
        ›
      </button>
    </div>
  );
}

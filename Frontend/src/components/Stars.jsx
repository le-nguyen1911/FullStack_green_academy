export default function Stars({ value }) {
  const full = Math.round(value || 0);
  return (
    <span className="text-sm" title={value ? `${value}/5` : "Chưa có đánh giá"}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={i <= full ? "text-yellow-500" : "text-stone-300"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

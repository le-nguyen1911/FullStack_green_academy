export default function StatusBadge({ active, on = "Đang hiển thị", off = "Đã ẩn" }) {
  return (
    <span className={`rounded px-2 py-0.5 text-xs ${active ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-600"}`}>
      {active ? on : off}
    </span>
  );
}

export default function Notice({ type = "success", children }) {
  if (!children) return null;
  const cls = type === "error" || type === "danger" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700";
  return (
    <p role={type === "success" ? "status" : "alert"} className={`mb-3 rounded p-2 text-sm ${cls}`}>{children}</p>
  );
}

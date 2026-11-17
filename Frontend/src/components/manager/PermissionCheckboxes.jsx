import { useState } from "react";

function groupByModule(permissions) {
  return permissions.reduce((acc, p) => {
    const module = p.module || "other";
    if (!acc[module]) acc[module] = [];
    acc[module].push(p);
    return acc;
  }, {});
}

export default function PermissionCheckboxes({
  allPermissions,
  selectedIds,
  onChange,
  disabled,
}) {
  const [filterText, setFilterText] = useState("");

  const normalizedFilter = filterText.trim().toLowerCase();

  const filtered = normalizedFilter
    ? allPermissions.filter(
        (p) =>
          p.code.toLowerCase().includes(normalizedFilter) ||
          p.name.toLowerCase().includes(normalizedFilter) ||
          p.module.toLowerCase().includes(normalizedFilter),
      )
    : allPermissions;

  const grouped = groupByModule(filtered);
  const modules = Object.keys(grouped).sort();

  const toggleAll = (modulePerms, allChecked) => {
    if (disabled) return;

    if (allChecked) {
      const moduleIds = new Set(modulePerms.map((p) => p.id));
      onChange(selectedIds.filter((id) => !moduleIds.has(id)));
    } else {
      const toAdd = modulePerms
        .filter((p) => !selectedIds.includes(p.id))
        .map((p) => p.id);

      onChange([...selectedIds, ...toAdd]);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Tìm quyền theo mã, tên hoặc module..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-9 text-sm outline-none transition focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10"
        />

        {filterText && (
          <button
            type="button"
            onClick={() => setFilterText("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      {modules.length === 0 && (
        <div className="py-3 text-center text-sm text-gray-400">
          Không tìm thấy quyền nào
        </div>
      )}

      {modules.map((module) => {
        const perms = grouped[module];

        const checkedCount = perms.filter((p) =>
          selectedIds.includes(p.id),
        ).length;

        const allChecked = checkedCount === perms.length;

        return (
          <div
            key={module}
            className="mb-2 overflow-hidden rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F4E37]">
                {module}
                <span className="ml-1.5 text-[10px] font-medium text-gray-400">
                  ({checkedCount}/{perms.length})
                </span>
              </span>

              {!disabled && (
                <button
                  type="button"
                  onClick={() => toggleAll(perms, allChecked)}
                  className={`rounded px-2 py-1 text-[11px] font-semibold transition ${
                    allChecked
                      ? "text-red-600 hover:bg-red-50"
                      : "text-[#6F4E37] hover:bg-[#6F4E37]/10"
                  }`}
                >
                  {allChecked ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2 px-3 py-2">
              {perms.map((p) => (
                <label
                  key={p.id}
                  className={`flex items-start gap-2 text-[13px] select-none ${
                    disabled
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.id)}
                    disabled={disabled}
                    onChange={() => {
                      if (disabled) return;

                      if (selectedIds.includes(p.id)) {
                        onChange(selectedIds.filter((id) => id !== p.id));
                      } else {
                        onChange([...selectedIds, p.id]);
                      }
                    }}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#6F4E37]"
                  />

                  <span>
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-gray-700">
                      {p.code}
                    </code>
                    <span className="ml-1.5 text-gray-500">{p.name}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

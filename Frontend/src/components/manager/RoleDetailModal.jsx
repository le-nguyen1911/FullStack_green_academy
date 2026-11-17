import { useState } from "react";
import BaseModal from "../../components/BaseModal";

const SYSTEM_ROLES = ["ADMIN", "MANAGER", "STAFF_SALE", "CUSTOMER"];

function groupByModule(permissions) {
  return permissions.reduce((acc, p) => {
    const module = p.module || "other";
    if (!acc[module]) acc[module] = [];
    acc[module].push(p);
    return acc;
  }, {});
}

export default function RoleDetailModal({
  role,
  detail,
  allPermsState,
  onClose,
}) {
  const [filterText, setFilterText] = useState("");

  const data = detail.data;

  const grantedIds = new Set(
    data?.permissionIds || (data?.permissions || []).map((p) => p.id),
  );

  const allPermissions = allPermsState.items || [];

  const normalizedFilter = filterText.trim().toLowerCase();

  const filtered = normalizedFilter
    ? allPermissions.filter(
        (p) =>
          p.code.toLowerCase().includes(normalizedFilter) ||
          p.name.toLowerCase().includes(normalizedFilter) ||
          (p.module || "other").toLowerCase().includes(normalizedFilter),
      )
    : allPermissions;

  const grouped = groupByModule(filtered);
  const modules = Object.keys(grouped).sort();

  const grantedCount = allPermissions.filter((p) =>
    grantedIds.has(p.id),
  ).length;

  return (
    <BaseModal
      title={`Chi tiết: ${role.name}`}
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
        >
          Đóng
        </button>
      }
    >
      {detail.status === "loading" && (
        <div className="py-6 text-center text-sm text-gray-400">
          Đang tải...
        </div>
      )}

      {detail.status === "failed" && (
        <div className="text-sm text-red-600">{detail.error}</div>
      )}

      {data && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1 text-[11px] font-bold uppercase text-gray-400">
                Tên
              </div>
              <div className="font-mono font-bold text-gray-800">
                {data.name}
              </div>
            </div>

            <div>
              <div className="mb-1 text-[11px] font-bold uppercase text-gray-400">
                Loại
              </div>

              {SYSTEM_ROLES.includes(data.name) ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-700">
                  Hệ thống
                </span>
              ) : (
                <span className="rounded-full bg-green-100 px-3 py-1 text-[11px] font-bold text-green-700">
                  Tùy chỉnh
                </span>
              )}
            </div>
          </div>

          {data.description && (
            <div>
              <div className="mb-1 text-[11px] font-bold uppercase text-gray-400">
                Mô tả
              </div>
              <div className="text-sm text-gray-700">{data.description}</div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <div className="text-xl font-bold text-green-600">
                {grantedCount}
              </div>
              <div className="text-[11px] text-gray-500">Đã cấp</div>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 text-center">
              <div className="text-xl font-bold text-amber-600">
                {allPermissions.length - grantedCount}
              </div>
              <div className="text-[11px] text-gray-500">Chưa cấp</div>
            </div>

            <div className="rounded-lg bg-[#6F4E37]/10 p-3 text-center">
              <div className="text-xl font-bold text-[#6F4E37]">
                {allPermissions.length}
              </div>
              <div className="text-[11px] text-gray-500">Tổng quyền</div>
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
              Toàn bộ quyền hạn
            </div>

            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Tìm quyền..."
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

            {allPermsState.status === "loading" && (
              <div className="text-sm text-gray-400">Đang tải quyền...</div>
            )}

            {modules.length === 0 && allPermsState.status !== "loading" && (
              <div className="py-3 text-center text-sm text-gray-400">
                Không tìm thấy quyền nào
              </div>
            )}

            <div className="max-h-[420px] overflow-y-auto pr-1">
              {modules.map((module) => {
                const perms = grouped[module];

                const moduleGranted = perms.filter((p) =>
                  grantedIds.has(p.id),
                ).length;

                return (
                  <div
                    key={module}
                    className="mb-2 overflow-hidden rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F4E37]">
                        {module}
                      </span>

                      <span className="text-[11px] text-gray-500">
                        {moduleGranted}/{perms.length} đã cấp
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 p-2">
                      {perms.map((p) => {
                        const granted = grantedIds.has(p.id);

                        return (
                          <div
                            key={p.id}
                            className={`flex items-start gap-2 rounded-md px-2 py-1 text-[13px] ${
                              granted ? "bg-green-50" : "bg-gray-50"
                            }`}
                          >
                            <span
                              className={`mt-px shrink-0 text-sm font-bold ${
                                granted ? "text-green-600" : "text-gray-300"
                              }`}
                            >
                              {granted ? "✓" : "○"}
                            </span>

                            <span className="min-w-0 flex-1">
                              <code
                                className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
                                  granted
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {p.code}
                              </code>

                              <span
                                className={`ml-1.5 ${
                                  granted ? "text-gray-700" : "text-gray-400"
                                }`}
                              >
                                {p.name}
                              </span>
                            </span>

                            {!granted && (
                              <span className="shrink-0 text-[10px] italic text-gray-400">
                                Chưa cấp
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </BaseModal>
  );
}

import {
  Eye,
  Pencil,
  Trash2,
  ShieldCheck,
  Users,
  KeyRound,
} from "lucide-react";

const SYSTEM_ROLES = ["ADMIN", "MANAGER", "STAFF_SALE", "CUSTOMER"];

export default function RoleTable({
  roles = [],
  loading = false,
  onDetail,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
        Đang tải danh sách vai trò...
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
        <ShieldCheck className="mx-auto mb-3 text-gray-300" size={36} />
        <p className="font-medium text-gray-700">Không tìm thấy vai trò nào</p>
        <p className="mt-1 text-sm text-gray-500">
          Thử thay đổi từ khóa tìm kiếm.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-5 py-4 font-semibold">Vai trò</th>
              <th className="px-5 py-4 font-semibold">Mô tả</th>
              <th className="px-5 py-4 text-center font-semibold">Quyền</th>
              <th className="px-5 py-4 text-center font-semibold">
                Người dùng
              </th>
              <th className="px-5 py-4 text-center font-semibold">Loại</th>
              <th className="px-5 py-4 text-center font-semibold">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {roles.map((role) => {
              const isSystemRole = SYSTEM_ROLES.includes(role.name);
              const isAdmin = role.name === "ADMIN";
              const hasUsers = Number(role.user_count || 0) > 0;

              return (
                <tr
                  key={role.id}
                  className="transition-colors hover:bg-gray-50/70"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck
                        size={17}
                        className="shrink-0 text-[#6F4E37]"
                      />
                      <span className="font-semibold text-gray-800">
                        {role.name}
                      </span>
                    </div>
                  </td>

                  <td className="max-w-xs px-5 py-4 text-gray-600">
                    <span className="line-clamp-2">
                      {role.description || "Chưa có mô tả"}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 text-gray-600">
                      <KeyRound size={15} />
                      {role.permission_count ?? 0}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 text-gray-600">
                      <Users size={15} />
                      {role.user_count ?? 0}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        isSystemRole
                          ? "bg-blue-50 text-blue-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {isSystemRole ? "Hệ thống" : "Tùy chỉnh"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onDetail(role)}
                        title="Xem chi tiết"
                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(role)}
                        title="Chỉnh sửa"
                        className="rounded-lg p-2 text-[#6F4E37] transition hover:bg-[#6F4E37]/10"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(role)}
                        title={
                          isAdmin
                            ? "Không thể xóa ADMIN"
                            : hasUsers
                              ? "Vai trò đang có người dùng"
                              : "Xóa vai trò"
                        }
                        disabled={isAdmin || hasUsers}
                        className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import BaseModal from "../../components/BaseModal";
import PermissionCheckboxes from "./PermissionCheckboxes";

export default function RoleFormModal({
  mode,
  selectedRole,
  formName,
  setFormName,
  formDesc,
  setFormDesc,
  formPerms,
  setFormPerms,
  permissions,
  isMutating,
  isSystemRole,
  onClose,
  onSubmit,
}) {
  const isEdit = mode === "edit";
  const isAdmin = selectedRole?.name === "ADMIN";

  return (
    <BaseModal
      title={isEdit ? `Chỉnh sửa: ${selectedRole.name}` : "Tạo vai trò mới"}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isMutating}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isMutating}
            className="rounded-lg bg-[#6F4E37] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#563B29] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isMutating
              ? isEdit
                ? "Đang lưu..."
                : "Đang tạo..."
              : isEdit
                ? "Lưu thay đổi"
                : "Tạo vai trò"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Tên vai trò
            {!isEdit && <span className="ml-1 text-red-500">*</span>}
          </label>

          <input
            type="text"
            value={formName}
            disabled={isEdit}
            onChange={(e) => setFormName(e.target.value.toUpperCase())}
            placeholder="VD: WAREHOUSE_STAFF"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm outline-none transition focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          />

          {!isEdit && (
            <p className="mt-1 text-xs text-gray-400">
              Tên sẽ được viết HOA tự động
            </p>
          )}

          {isEdit && isSystemRole(selectedRole) && (
            <p className="mt-1 text-xs text-amber-600">
              Không thể đổi tên vai trò hệ thống
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Mô tả
          </label>

          <input
            type="text"
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
            disabled={isEdit && isAdmin}
            placeholder="Mô tả ngắn về vai trò"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Quyền hạn
          </label>

          {isEdit && isAdmin ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-700">
              Quyền của vai trò ADMIN được bảo vệ và không thể thay đổi.
            </div>
          ) : permissions.status === "loading" ? (
            <div className="py-3 text-sm text-gray-400">Đang tải quyền...</div>
          ) : permissions.items?.length > 0 ? (
            <PermissionCheckboxes
              allPermissions={permissions.items}
              selectedIds={formPerms}
              onChange={setFormPerms}
              disabled={false}
            />
          ) : (
            <div className="py-3 text-sm text-gray-400">
              Chưa có dữ liệu quyền hạn
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
}

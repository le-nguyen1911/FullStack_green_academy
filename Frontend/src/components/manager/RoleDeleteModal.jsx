import BaseModal from "../../components/BaseModal";

export default function RoleDeleteModal({
  role,
  isMutating,
  onClose,
  onConfirm,
}) {
  return (
    <BaseModal
      title="Xác nhận xóa vai trò"
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
            onClick={onConfirm}
            disabled={isMutating}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isMutating ? "Đang xóa..." : "Xác nhận xóa"}
          </button>
        </div>
      }
    >
      <p className="text-sm leading-6 text-gray-600">
        Bạn có chắc muốn xóa vai trò{" "}
        <strong className="font-bold text-red-600">{role.name}</strong>?
        <br />
        Hành động này không thể hoàn tác.
      </p>
    </BaseModal>
  );
}

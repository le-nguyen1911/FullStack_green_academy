import { ShieldCheck, Plus } from "lucide-react";

export default function RoleHeader({ onCreate }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#6F4E37]/10">
          <ShieldCheck size={24} className="text-[#6F4E37]" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-gray-800">Quản lý vai trò</h1>

          <p className="mt-0.5 text-sm text-gray-500">
            Quản lý vai trò và quyền hạn người dùng
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6F4E37] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#563B29] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#6F4E37]/30"
      >
        <Plus size={18} />
        Tạo vai trò
      </button>
    </div>
  );
}

import { Search, X } from "lucide-react";

export default function RoleSearch({ value, onChange }) {
  return (
    <div className="w-full sm:max-w-md">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tìm kiếm vai trò..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Xóa nội dung tìm kiếm"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

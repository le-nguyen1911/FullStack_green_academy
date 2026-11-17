import { ChevronLeft, ChevronRight } from "lucide-react";

export default function RolePagination({
  currentPage,
  totalPages,
  total,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <div className="flex flex-col gap-3 rounded-b-xl border-t border-gray-100 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      {/* Information */}
      <p className="text-sm text-gray-500">
        Tổng cộng <span className="font-semibold text-gray-800">{total}</span>{" "}
        vai trò
        <span className="mx-2 text-gray-300">|</span>
        Trang <span className="font-semibold text-gray-800">{currentPage}</span>
        {" / "}
        {totalPages}
      </p>

      {/* Navigation */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={isFirstPage}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-[#6F4E37] hover:bg-[#6F4E37]/5 hover:text-[#6F4E37] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:bg-transparent disabled:hover:text-gray-600"
          aria-label="Trang trước"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          disabled={isLastPage}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-[#6F4E37] hover:bg-[#6F4E37]/5 hover:text-[#6F4E37] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:bg-transparent disabled:hover:text-gray-600"
          aria-label="Trang sau"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

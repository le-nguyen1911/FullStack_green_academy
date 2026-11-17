import React from "react";
import { formatVND } from "../../../util/format";

const TopSellingItems = ({ items = [], onViewAll }) => {
  return (
    <section
      aria-label="Sản phẩm bán chạy"
      className="flex flex-col justify-between bg-[#FFF7F1] rounded-[18px] px-6 py-5"
    >
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="m-0 text-[15px] font-semibold tracking-tight text-[#39251B]">
          Top Selling Item
        </h2>
        <button
          type="button"
          onClick={onViewAll}
          className="px-3 py-1 text-[11px] font-medium text-[#8B7569] bg-transparent border border-[#DFD3CA] rounded-md transition-colors cursor-pointer hover:bg-[#783C20] hover:border-[#783C20] hover:text-white"
        >
          View All
        </button>
      </div>

      <div className="flex flex-col gap-[18px] mt-1">
        {items.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                aria-hidden="true"
                style={{ backgroundColor: item.badgeColor }}
                className="w-[38px] h-[38px] rounded-full shrink-0"
              />
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[13.5px] font-semibold text-[#39251B] truncate">
                  {item.name}
                </span>
                <span className="text-xs text-[#8B7569]">
                  {item.soldCount} {item.unit}
                </span>
              </div>
            </div>

            <span className="text-[13.5px] font-semibold text-[#39251B] text-right whitespace-nowrap">
              {formatVND(item.revenue)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopSellingItems;

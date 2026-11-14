import React from "react";

import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { formatVND } from "../util/format";
import Stars from "./Stars";
import { Eye, ShoppingCart } from "@primeicons/react";

const Card = ({ p }) => {
  const brands = useSelector((state) => state.products.brands.items);
  const brand = brands.find((b) => String(b.id) === String(p.brand_id));
  const soldOut = Number(p.total_stock) === 0;
  const hasRange =
    p.min_price != null &&
    p.max_price != null &&
    Number(p.min_price) !== Number(p.max_price);
  return (
    <Link
      to={`/products/${p.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-stone-200 bg-white
             text-stone-800! transition hover:shadow-md no-underline! hover:border-amber-900!"
    >
      {p.is_new && (
        <span className="absolute left-3 top-3 z-10 rounded bg-amber-900 px-2 py-0.5 text-xs font-medium text-white">
          NEW
        </span>
      )}
      {soldOut && (
        <span className="absolute right-2 top-2 z-10 rounded bg-stone-700 px-1.5 py-0.5 text-[9px] font-medium text-white">
          Hết hàng
        </span>
      )}

      <div className="flex aspect-square items-center justify-center p-2 relative group/image  overflow-hidden">
        <img
          src={p.image_url}
          alt={p.name}
          loading="lazy"
          className={`max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105  ${
            soldOut ? "opacity-60" : ""
          }`}
        />
        <div
          className="
    absolute bottom-1 left-1/2 z-10
    opacity-0 flex items-center gap-2
    -translate-x-1/2 translate-y-2
     pointer-events-none
    transition-all duration-300 ease-out
    group-hover/image:-translate-y-2.5
    group-hover/image:opacity-100!
    group-hover/image:pointer-events-auto
  "
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-stone-700 shadow-md transition-all duration-300 hover:bg-amber-900! hover:text-white hover:scale-110">
            <Eye />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-stone-700 shadow-md transition-all duration-300 hover:bg-amber-900! hover:text-white hover:scale-110">
            <ShoppingCart />
          </div>
        </div>
      </div>

      <div className="px-1.5 pb-2 text-center">
        <Stars value={p.avg_rating} />

        <p className="mt-0.5 mb-0.5 line-clamp-2 min-h-[2rem] text-xs font-normal leading-tight text-[16px]">
          {p.name}
        </p>

        <p className="m-0 text-xs font-bold text-red-700">
          {p.min_price == null
            ? "Liên hệ"
            : `${hasRange ? "Từ " : ""}${formatVND(p.min_price)}`}
        </p>
      </div>
    </Link>
  );
};

export default Card;

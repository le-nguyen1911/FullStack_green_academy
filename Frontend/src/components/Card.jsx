import React, { useState, useEffect } from "react";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { formatVND } from "../util/format";
import Stars from "./Stars";
import { GRIND_LABELS } from "../util/format";
import { Eye, ShoppingCart } from "@primeicons/react";
import { addToCart as addToCartThunk } from "../redux/slices/cartSlice";
import { useAuth } from "../hooks/useAuth";
import { fetchProductDetail } from "../redux/slices/productSlice";

const Card = ({ p }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [notice, setNotice] = useState("");
  const [showCartModal, setShowCartModal] = useState(false);
  const [variants, setVariants] = useState([]);
  const [variantId, setVariantId] = useState(null);
  const [qty, setQty] = useState(1);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [adding, setAdding] = useState(false);
  const brands = useSelector((state) => state.products.brands.items);
  const brand = brands.find((b) => String(b.id) === String(p.brand_id));
  const soldOut = Number(p.total_stock) === 0;
  const selected =
    variants.find((v) => String(v.id) === String(variantId)) ??
    variants.find((v) => Number(v.quantity) > 0) ??
    variants[0];

  const max = selected ? Math.min(99, Number(selected.quantity)) : 0;

  const safeQty = Math.min(Math.max(qty, 1), Math.max(max, 1));
  const hasRange =
    p.min_price != null &&
    p.max_price != null &&
    Number(p.min_price) !== Number(p.max_price);

  const Addcart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setNotice("");

    if (!user) {
      return navigate("/login", {
        state: { from: location.pathname },
      });
    }

    try {
      setLoadingVariants(true);

      const product = await dispatch(fetchProductDetail(p.id)).unwrap();

      const productVariants = product.variants || [];

      if (productVariants.length === 0) {
        setNotice("Sản phẩm chưa có phân loại.");
        return;
      }

      setVariants(productVariants);

      const firstAvailable = productVariants.find(
        (v) => Number(v.quantity) > 0,
      );

      setVariantId(firstAvailable?.id ?? productVariants[0].id);

      setQty(1);
      setShowCartModal(true);
    } catch (error) {
      setNotice(
        typeof error === "string" ? error : "Không thể tải phân loại sản phẩm.",
      );
    } finally {
      setLoadingVariants(false);
    }
  };
  const confirmAddToCart = async () => {
    if (!selected || max <= 0) {
      setNotice("Phân loại này đã hết hàng.");
      return;
    }

    try {
      setAdding(true);

      await dispatch(
        addToCartThunk({
          variant_id: selected.id,
          quantity: safeQty,
        }),
      ).unwrap();

      setNotice("Đã thêm vào giỏ hàng!");
      setShowCartModal(false);
    } catch (error) {
      setNotice(
        typeof error === "string" ? error : "Không thể thêm vào giỏ hàng.",
      );
    } finally {
      setAdding(false);
    }
  };
  return (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-stone-200 bg-white
      text-stone-800 transition hover:shadow-md hover:border-amber-900!"
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

      <div className="relative aspect-square overflow-hidden group/image">
        <Link
          to={`/products/${p.id}`}
          className="flex w-full h-full items-center justify-center p-2"
        >
          <img
            src={p.image_url}
            alt={p.name}
            loading="lazy"
            className={`max-h-full max-w-full object-contain transition-transform duration-300 group-hover/image:scale-105 ${
              soldOut ? "opacity-60" : ""
            }`}
          />
        </Link>

        <div
          className="
      absolute -bottom-9 left-1/2 z-20
    flex -translate-x-1/2 items-center gap-2 
    rounded-full p-2 shadow-lg
    opacity-0 pointer-events-auto
    transition-all duration-300 ease-out
      group-hover/image:-translate-y-8
      group-hover/image:opacity-100!
      group-hover/image:visible"
        >
          <Link
            to={`/products/${p.id}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-stone-700! shadow-md hover:bg-amber-900! hover:text-white! transition"
            title="Xem chi tiết"
          >
            <Eye />
          </Link>
          <button
            type="button"
            onClick={Addcart}
            disabled={soldOut || adding}
            className="flex h-9 w-9 items-center justify-center rounded-full! bg-white text-stone-700 shadow-md hover:bg-amber-900! hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Thêm vào giỏ hàng"
          >
            <ShoppingCart />
          </button>
        </div>
      </div>
      <div className="px-1.5 pb-2 text-center">
        <Stars value={p.avg_rating} />

        <Link
          to={`/products/${p.id}`}
          className="block mt-0.5 mb-0.5 line-clamp-2 min-h-[2rem] text-[16px] text-stone-800! no-underline!"
        >
          {p.name}
        </Link>
        <p className="m-0 text-xs font-bold text-red-700">
          {p.min_price == null
            ? "Liên hệ"
            : `${hasRange ? "Từ " : ""}${formatVND(p.min_price)}`}
        </p>
        {notice && (
          <p
            className={`text-xs mt-1 ${
              notice.includes("Đã thêm") ? "text-green-700" : "text-red-600"
            }`}
          >
            {notice}
          </p>
        )}
      </div>
      {showCartModal && (
        <div
          className={`
    fixed inset-0 z-50
    flex items-center justify-center
    bg-black/50
    transition-opacity duration-300 ease-in-out
    ${showCartModal ? "opacity-100" : "opacity-0 pointer-events-none"}
  `}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-stone-800">
                Chọn phân loại sản phẩm
              </h4>

              <button
                type="button"
                onClick={() => setShowCartModal(false)}
                className="text-xl2! text-stone-500 hover:text-red-600"
              >
                x
              </button>
            </div>

            <div className="mb-4 flex gap-3">
              <img
                src={p.image_url}
                alt={p.name}
                className="h-20 w-20 rounded-lg border object-contain"
              />

              <div>
                <p className="font-medium text-stone-800">{p.name}</p>

                {selected && (
                  <p className="mt-1 font-bold text-red-700">
                    {formatVND(selected.price)}
                  </p>
                )}
              </div>
            </div>

            <p className="mb-2 font-medium text-stone-800">Phân loại</p>

            <div className="mb-4 flex flex-wrap gap-2">
              {variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  disabled={Number(v.quantity) <= 0}
                  onClick={() => {
                    setVariantId(v.id);
                    setQty(1);
                  }}
                  className={`rounded-lg border px-3 py-2 text-sm transition ${
                    String(v.id) === String(selected?.id)
                      ? "border-amber-900 bg-amber-50 text-amber-900"
                      : "border-stone-200 bg-white text-stone-700"
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  {v.variant_name}

                  {v.grind_type && (
                    <span className="block text-xs text-stone-500">
                      {GRIND_LABELS[v.grind_type]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {selected && (
              <>
                <p className="mb-3 text-sm text-stone-500">
                  {max > 0 ? `Còn ${selected.quantity} sản phẩm` : "Hết hàng"}
                </p>

                <div className="mb-5 flex items-center justify-between">
                  <span className="font-medium">Số lượng</span>

                  <div className="flex items-center rounded-lg border border-stone-300">
                    <button
                      type="button"
                      disabled={safeQty <= 1}
                      onClick={() => setQty(safeQty - 1)}
                      className="h-9 w-9 disabled:opacity-40"
                    >
                      −
                    </button>

                    <span className="w-10 text-center">{safeQty}</span>

                    <button
                      type="button"
                      disabled={safeQty >= max}
                      onClick={() => setQty(safeQty + 1)}
                      className="h-9 w-9 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCartModal(false)}
                className="flex-1 rounded-lg border border-stone-300 py-2 text-stone-700 hover:bg-stone-100"
              >
                Hủy
              </button>

              <button
                type="button"
                disabled={!selected || max <= 0 || adding}
                onClick={confirmAddToCart}
                className="flex-1 rounded-lg bg-amber-900 py-2 text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {adding ? "Đang thêm..." : "Thêm vào giỏ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBrands,
  fetchCategories,
  fetchPriceRange,
  fetchProducts,
} from "../redux/slices/productSlice";
import ProductCard from "../components/Card";
import Pagination from "../components/Panigation";
import { formatVND } from "../util/format";

const SORTS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá thấp đến cao" },
  { value: "price_desc", label: "Giá cao đến thấp" },
  { value: "name_asc", label: "Tên A đến Z" },
];

const splitIds = (v) => v?.split(",").filter(Boolean) ?? [];

export default function ProductList() {
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const query = params.toString();

  const list = useSelector((s) => s.products.list);
  const categories = useSelector((s) => s.products.categories.items);
  const brands = useSelector((s) => s.products.brands.items);
  const priceRange = useSelector((s) => s.products.priceRange);

  const [keyword, setKeyword] = useState(params.get("q") || "");
  const [price, setPrice] = useState({
    min: params.get("min_price") || "",
    max: params.get("max_price") || "",
  });

  const [priceError, setPriceError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const selectedCats = splitIds(params.get("category_id"));
  const selectedBrands = splitIds(params.get("brand_id"));

  const minBound = Number(priceRange.min) || 0;
  const maxBound = Math.max(Number(priceRange.max) || 1, minBound + 1);

  const currentMin =
    price.min === "" ? minBound : Math.max(minBound, Number(price.min));

  const currentMax =
    price.max === "" ? maxBound : Math.min(maxBound, Number(price.max));

  const minPercent =
    ((currentMin - minBound) / (maxBound - minBound)) * 100;

  const maxPercent =
    ((currentMax - minBound) / (maxBound - minBound)) * 100;

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
    dispatch(fetchPriceRange());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts(Object.fromEntries(new URLSearchParams(query))));
  }, [dispatch, query]);

  useEffect(() => {
    const p = new URLSearchParams(query);

    setKeyword(p.get("q") || "");
    setPrice({
      min: p.get("min_price") || "",
      max: p.get("max_price") || "",
    });
    setPriceError("");
  }, [query]);

  const update = (patch) => {
    const next = new URLSearchParams(params);

    Object.entries(patch).forEach(([key, value]) => {
      value === "" || value == null
        ? next.delete(key)
        : next.set(key, value);
    });

    if (!("page" in patch)) next.delete("page");

    setParams(next);
  };

  const toggle = (key, current, id) => {
    const idStr = String(id);

    const next = current.includes(idStr)
      ? current.filter((x) => x !== idStr)
      : [...current, idStr];

    update({ [key]: next.join(",") });
  };

  const handleMinPrice = (value) => {
    const nextMin = Number(value);

    setPrice((prev) => {
      const prevMax = prev.max === "" ? maxBound : Number(prev.max);

      return {
        ...prev,
        min: String(Math.min(nextMin, prevMax)),
      };
    });

    setPriceError("");
  };

  const handleMaxPrice = (value) => {
    const nextMax = Number(value);

    setPrice((prev) => {
      const prevMin = prev.min === "" ? minBound : Number(prev.min);

      return {
        ...prev,
        max: String(Math.max(nextMax, prevMin)),
      };
    });

    setPriceError("");
  };

  const applyPrice = () => {
    const min = price.min === "" ? minBound : Number(price.min);
    const max = price.max === "" ? maxBound : Number(price.max);

    if (
      Number.isNaN(min) ||
      Number.isNaN(max) ||
      min < minBound ||
      max > maxBound ||
      min > max
    ) {
      setPriceError("Khoảng giá không hợp lệ");
      return false;
    }

    setPriceError("");

    update({
      min_price: min <= minBound ? "" : min,
      max_price: max >= maxBound ? "" : max,
    });

    return true;
  };

  const clearFilters = () => {
    setParams({});
    setShowFilters(false);
  };

  const from =
    list.total === 0 ? 0 : (list.page - 1) * list.limit + 1;

  const to = Math.min(list.page * list.limit, list.total);
  const loading = list.status === "loading";

  const hasFilter = [...params.keys()].some((k) => k !== "page");

  const activeFilterCount =
    selectedCats.length +
    selectedBrands.length +
    Number(params.has("min_price") || params.has("max_price"));

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-5 sm:py-8">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              update({ q: keyword.trim() });
            }}
            className="flex flex-1 min-w-0"
          >
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full min-w-0 border border-stone-300 rounded-l-xl px-3 py-2.5 text-sm outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800 transition"
            />

            <button
              type="submit"
              className="shrink-0 px-5 bg-amber-900 hover:bg-amber-800 text-white text-sm rounded-r-xl transition-colors duration-300"
            >
              Tìm kiếm
            </button>
          </form>

          <div className="flex gap-2">
            <select
              value={params.get("sort") || "newest"}
              onChange={(e) => update({ sort: e.target.value })}
              className="flex-1 sm:flex-none min-w-0 border border-stone-300 rounded-xl px-3 py-2.5 text-sm outline-none bg-white focus:border-amber-800"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 border border-stone-300 rounded-xl text-sm whitespace-nowrap hover:bg-stone-50 transition-colors"
            >
              <i className="pi pi-sliders-h" />
              Bộ lọc
              {activeFilterCount > 0 && (
                <span className="bg-amber-900 text-white rounded-full min-w-5 h-5 px-1 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-stone-500">
          <span>
            Hiển thị {from}–{to} của {list.total} kết quả
          </span>

          {hasFilter && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-amber-900 hover:text-amber-700 hover:underline transition-colors"
            >
              Xóa tất cả bộ lọc
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <aside
          className={`
            w-full lg:w-64 lg:shrink-0
            ${showFilters ? "block" : "hidden lg:block"}
          `}
        >
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-6 shadow-sm lg:shadow-none">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-stone-800">
                  DANH MỤC
                </h3>
                <i className="pi pi-list text-amber-900" />
              </div>

              <ul className="space-y-3 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
                {categories.map((c) => (
                  <li key={c.id}>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-600 hover:text-amber-900 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedCats.includes(String(c.id))}
                        onChange={() =>
                          toggle("category_id", selectedCats, c.id)
                        }
                        className="accent-amber-900 w-4 h-4 shrink-0 cursor-pointer"
                      />

                      <span className="flex-1 min-w-0 break-words ml-2">
                        {c.name}
                      </span>

                      {c.product_count !== undefined && (
                        <span className="text-stone-400 text-xs shrink-0">
                          ({c.product_count})
                        </span>
                      )}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-stone-100" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-stone-800">
                  THƯƠNG HIỆU
                </h3>
                <i className="pi pi-tag text-amber-900" />
              </div>

              <ul className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {brands.map((b) => (
                  <li key={b.id}>
                    <label className="flex items-center t gap-2 cursor-pointer text-sm text-stone-600 hover:text-amber-900 transition-colors leading-relaxed">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(String(b.id))}
                        onChange={() =>
                          toggle("brand_id", selectedBrands, b.id)
                        }
                        className="accent-amber-900 w-4 h-4 shrink-0 cursor-pointer"
                      />

                      <span className="flex-1 min-w-0 break-words ml-2">
                        {b.name}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-stone-100" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-stone-800">
                  KHOẢNG GIÁ
                </h3>
                <i className="pi pi-wallet text-amber-900" />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-5">
                <div className="bg-stone-50 rounded-lg p-2.5 min-w-0">
                  <p className="text-xs text-stone-400 mb-1">Giá thấp nhất</p>
                  <p className="text-xs sm:text-sm font-semibold text-amber-900 truncate">
                    {formatVND(currentMin)}
                  </p>
                </div>

                <div className="bg-stone-50 rounded-lg p-2.5 min-w-0 text-right">
                  <p className="text-xs text-stone-400 mb-1">Giá cao nhất</p>
                  <p className="text-xs sm:text-sm font-semibold text-amber-900 truncate">
                    {formatVND(currentMax)}
                  </p>
                </div>
              </div>

              <div className="relative h-7 flex items-center mx-1">
                <div className="absolute w-full h-1.5 rounded-full bg-stone-200" />

                <div
                  className="absolute h-1.5 rounded-full bg-amber-900"
                  style={{
                    left: `${minPercent}%`,
                    right: `${100 - maxPercent}%`,
                  }}
                />

                <input
                  type="range"
                  min={minBound}
                  max={maxBound}
                  step="1000"
                  value={currentMin}
                  onChange={(e) => handleMinPrice(e.target.value)}
                  aria-label="Giá thấp nhất"
                  className="price-range-slider absolute w-full"
                  style={{ zIndex: currentMin >= maxBound - 1 ? 5 : 3 }}
                />

                <input
                  type="range"
                  min={minBound}
                  max={maxBound}
                  step="1000"
                  value={currentMax}
                  onChange={(e) => handleMaxPrice(e.target.value)}
                  aria-label="Giá cao nhất"
                  className="price-range-slider absolute w-full"
                  style={{ zIndex: 4 }}
                />
              </div>

              <div className="flex justify-between text-xs text-stone-400 mt-2">
                <span>{formatVND(minBound)}</span>
                <span>{formatVND(maxBound)}</span>
              </div>

              {priceError && (
                <p className="text-xs text-red-600 mt-3">{priceError}</p>
              )}

              <button
                type="button"
                onClick={() => {
                  if (applyPrice()) {
                    setShowFilters(false);
                  }
                }}
                className="w-full mt-5 px-4 py-2.5 bg-amber-900 hover:bg-amber-800 text-white text-sm font-medium rounded-xl transition-colors duration-300"
              >
                <i className="pi pi-filter mr-2" />
                Áp dụng lọc giá
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="lg:hidden w-full border border-stone-300 rounded-xl py-2.5 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Đóng bộ lọc
            </button>
          </div>
        </aside>

        <section className="flex-1 min-w-0">
          {list.status === "failed" && (
            <div className="mb-4 text-red-600 text-sm">
              {list.error}{" "}
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    fetchProducts(
                      Object.fromEntries(new URLSearchParams(query)),
                    ),
                  )
                }
                className="underline"
              >
                Thử lại
              </button>
            </div>
          )}

          {list.items.length === 0 && !loading && list.status !== "failed" ? (
            <p className="text-stone-500 text-sm py-8 text-center">
              Không có sản phẩm phù hợp.
            </p>
          ) : (
            <div
              className={`
                grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3
                gap-3 sm:gap-4 lg:gap-6
                transition-opacity duration-300 
                ${loading ? "opacity-50" : ""}
              `}
            >
              {list.items.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}

          <div className="mt-8 overflow-x-auto">
            <div className="min-w-max flex justify-center">
              <Pagination
                page={list.page}
                totalPages={list.totalPages}
                onChange={(n) => update({ page: n })}
              />
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .price-range-slider {
          appearance: none;
          -webkit-appearance: none;
          background: transparent;
          pointer-events: none;
          height: 7px;
          margin: 0;
          outline: none;
        }

        .price-range-slider::-webkit-slider-runnable-track {
          height: 7px;
          background: transparent;
        }

        .price-range-slider::-moz-range-track {
          height: 7px;
          background: transparent;
        }

        .price-range-slider::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          pointer-events: auto;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #78350f;
          border: 3px solid white;
          box-shadow: 0 1px 5px rgba(0, 0, 0, 0.25);
          cursor: grab;
          margin-top: -5.5px;
          transition: transform 150ms ease;
        }

        .price-range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }

        .price-range-slider::-moz-range-thumb {
          pointer-events: auto;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #78350f;
          border: 3px solid white;
          box-shadow: 0 1px 5px rgba(0, 0, 0, 0.25);
          cursor: grab;
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d6c4b5 transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d6c4b5;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
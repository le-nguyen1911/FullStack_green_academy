import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchManagerProducts,
  fetchOptions,
  setProductStatus,
} from "../../redux/slices/managerProductSlice";
import { useAuth } from "../../hooks/useAuth";
import { cld } from "../../util/image";
import { formatVND } from "../../util/format";
import { errText } from "../../util/product";
import Notice from "@/components/manager/Notice";
import StatusBadge from "@/components/manager/StatusBadge";
import Pagination from "@/components/Panigation";
import Stars from "@/components/Stars";
import { Trash } from "@primeicons/react";
import { Pen, PenLine } from "lucide-react";


const LIMIT = 10;
const SORTS = [
  { value: "newest", label: "Mới nhất" },
  { value: "name_asc", label: "Tên A đến Z" },
  { value: "name_desc", label: "Tên Z đến A" },
  { value: "price_asc", label: "Giá thấp đến cao" },
  { value: "price_desc", label: "Giá cao đến thấp" },
  { value: "rating_desc", label: "Đánh giá cao nhất" },
];

export default function ManagerProduct() {
  const dispatch = useDispatch();
  const { hasPermission } = useAuth();
  const [params, setParams] = useSearchParams();
  const query = params.toString();
  const list = useSelector((s) => s.managerProducts.list);
  const { categories, brands } = useSelector((s) => s.managerProducts.options);

  const [keyword, setKeyword] = useState(params.get("q") || "");
  const [price, setPrice] = useState({
    min: params.get("min_price") || "",
    max: params.get("max_price") || "",
  });
  const [filterError, setFilterError] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    dispatch(fetchOptions());
  }, [dispatch]);

  const load = () =>
    dispatch(
      fetchManagerProducts({
        ...Object.fromEntries(new URLSearchParams(query)),
        limit: LIMIT,
      }),
    );

  useEffect(() => {
    load();
  }, [dispatch, query]); 

  useEffect(() => {
    const p = new URLSearchParams(query);
    setKeyword(p.get("q") || "");
    setPrice({ min: p.get("min_price") || "", max: p.get("max_price") || "" });
    setFilterError("");
  }, [query]);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) =>
      v === "" || v == null ? next.delete(k) : next.set(k, v),
    );
    if (!("page" in patch)) next.delete("page");
    setParams(next);
  };

  const applyPrice = () => {
    const min = price.min === "" ? null : Number(price.min);
    const max = price.max === "" ? null : Number(price.max);
    if (
      (min !== null && (Number.isNaN(min) || min < 0)) ||
      (max !== null && (Number.isNaN(max) || max < 0))
    )
      return setFilterError("Giá phải là số không âm");
    if (min !== null && max !== null && min > max)
      return setFilterError("Giá thấp nhất không được lớn hơn giá cao nhất");
    setFilterError("");
    update({ min_price: price.min, max_price: price.max });
  };

  const toggleStatus = async (p) => {
    const hide = Boolean(p.status);
    if (
      hide &&
      !window.confirm(
        `Ẩn sản phẩm "${p.name}"? Khách sẽ không còn thấy sản phẩm này.`,
      )
    )
      return;
    setMsg({ type: "", text: "" });
    try {
      await dispatch(setProductStatus({ id: p.id, status: !hide })).unwrap();
      setMsg({
        type: "success",
        text: hide ? "Đã ẩn sản phẩm" : "Đã khôi phục sản phẩm",
      });
      load();
    } catch (e) {
      setMsg({ type: "error", text: errText(e) });
    }
  };

  const hasFilter = [...params.keys()].some((k) => k !== "page");

  return (
    <div>
      <div className="mb-4 flex items-center">
        <h2 className="text-xl font-semibold">Quản lý sản phẩm</h2>
        {hasPermission("product:create") && (
          <Link
            to="/manager/products/new"
            className="ml-auto rounded bg-amber-900 px-4 py-2 text-white no-underline"
          >
            + Thêm sản phẩm
          </Link>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: keyword.trim() });
          }}
          className="flex"
        >
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên..."
            className="rounded-l border px-3 py-2 outline-none"
          />
          <button className="rounded-r bg-amber-900 px-4 text-white">
            Tìm
          </button>
        </form>

        <select
          value={params.get("status") || "all"}
          onChange={(e) =>
            update({ status: e.target.value === "all" ? "" : e.target.value })
          }
          className="rounded border px-3 py-2"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang bán</option>
          <option value="inactive">Đã ẩn</option>
        </select>

        <select
          value={params.get("category_id") || ""}
          onChange={(e) => update({ category_id: e.target.value })}
          className="rounded border px-3 py-2"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={params.get("brand_id") || ""}
          onChange={(e) => update({ brand_id: e.target.value })}
          className="rounded border px-3 py-2"
        >
          <option value="">Tất cả thương hiệu</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={params.get("sort") || "newest"}
          onChange={(e) => update({ sort: e.target.value })}
          className="rounded border px-3 py-2"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0"
            placeholder="Giá từ"
            value={price.min}
            onChange={(e) => setPrice({ ...price, min: e.target.value })}
            className="w-28 rounded border px-2 py-2"
          />
          <span>–</span>
          <input
            type="number"
            min="0"
            placeholder="đến"
            value={price.max}
            onChange={(e) => setPrice({ ...price, max: e.target.value })}
            className="w-28 rounded border px-2 py-2"
          />
          <button
            onClick={applyPrice}
            className="rounded bg-amber-900 px-3 py-2 text-white"
          >
            Lọc giá
          </button>
        </div>

        {hasFilter && (
          <button
            onClick={() => setParams({})}
            className="text-sm text-amber-900 underline"
          >
            Xóa bộ lọc
          </button>
        )}
        <span className="ml-auto text-sm text-stone-500">
          {list.total} sản phẩm
        </span>
      </div>

      <Notice type="error">{filterError}</Notice>
      <Notice type={msg.type}>{msg.text}</Notice>
      {list.status === "failed" && (
        <p className="mb-3 text-red-600">
          {list.error}{" "}
          <button onClick={load} className="underline">
            Thử lại
          </button>
        </p>
      )}

      <div
        className={`overflow-x-auto rounded-lg border bg-white ${list.status === "loading" ? "opacity-60" : ""}`}
      >
        <table className="w-full text-sm">
          <thead className="bg-stone-100 text-left">
            <tr>
              <th className="p-3">Sản phẩm</th>
              <th className="p-3">Danh mục</th>
              <th className="p-3">Thương hiệu</th>
              <th className="p-3">Giá từ</th>
              <th className="p-3">Tồn kho</th>
              <th className="p-3">Đánh giá</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.items.length === 0 && list.status !== "loading" && (
              <tr>
                <td colSpan="8" className="p-6 text-center text-stone-500">
                  Không có sản phẩm
                </td>
              </tr>
            )}
            {list.items.map((p) => {
              const active = Boolean(p.status);
              return (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={cld(p.image_url, "w_80,f_auto,q_auto")}
                        alt=""
                        className="h-10 w-10 object-contain"
                      />
                      <span className="line-clamp-2 max-w-[14rem]">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">{p.category_name}</td>
                  <td className="p-3">{p.brand_name}</td>
                  <td className="p-3">
                    {p.min_price == null ? "—" : formatVND(p.min_price)}
                  </td>
                  <td
                    className={`p-3 ${Number(p.total_stock) === 0 ? "font-semibold text-red-600" : ""}`}
                  >
                    {p.total_stock}
                  </td>
                  <td className="p-3">
                    <Stars value={p.avg_rating} />{" "}
                    <span className="text-xs text-stone-500">
                      ({p.review_count})
                    </span>
                  </td>
                  <td className="p-3">
                    <StatusBadge active={active} on="Đang bán" />
                  </td>
                  <td className="space-x-3 whitespace-nowrap p-3 text-right flex items-center">
                    <Link
                      to={`/manager/products/${p.id}`}
                      className="text-amber-900 underline"
                    >
                      {hasPermission("product:update") ? (
                        <span className="">
                          <Pen size={14} />
                        </span>
                      ) : (
                        "Xem"
                      )}
                    </Link>
                    {active && hasPermission("product:delete") && (
                      <button
                        onClick={() => toggleStatus(p)}
                        className="text-red-600 underline  "
                      >
                        <Trash />
                      </button>
                    )}
                    {!active && hasPermission("product:update") && (
                      <button
                        onClick={() => toggleStatus(p)}
                        className="text-green-700 underline"
                      >
                        Khôi phục
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        page={list.page}
        totalPages={list.totalPages}
        onChange={(n) => update({ page: n })}
      />
    </div>
  );
}

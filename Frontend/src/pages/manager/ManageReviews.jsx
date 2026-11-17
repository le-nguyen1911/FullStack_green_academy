import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteAdminReview,
  fetchAdminReviews,
  setReviewStatus,
} from "../../redux/slices/managerReviewSlice";
import { cld } from "../../util/image";

import Stars from "@/components/Stars";
import Pagination from "@/components/Panigation";
import StatusBadge from "@/components/manager/StatusBadge";
import Modal from "@/components/manager/Modal";
import Notice from "@/components/manager/Notice";
import { Eye, Trash } from "@primeicons/react";

const LIMIT = 10;
const SORTS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "rating_desc", label: "Sao cao đến thấp" },
  { value: "rating_asc", label: "Sao thấp đến cao" },
];
const fmt = (d) => new Date(d).toLocaleString("vi-VN");

export default function ManageReviews() {
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const query = params.toString();
  const list = useSelector((s) => s.managerReviews);

  const [keyword, setKeyword] = useState(params.get("q") || "");
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [dateError, setDateError] = useState("");

  const load = () =>
    dispatch(
      fetchAdminReviews({
        ...Object.fromEntries(new URLSearchParams(query)),
        limit: LIMIT,
      }),
    );

  useEffect(() => {
    load();
  }, [dispatch, query]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    setKeyword(new URLSearchParams(query).get("q") || "");
  }, [query]);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) =>
      v === "" || v == null ? next.delete(k) : next.set(k, v),
    );
    if (!("page" in patch)) next.delete("page");
    setParams(next);
  };

  const changeDate = (key, value) => {
    const from = key === "from" ? value : params.get("from");
    const to = key === "to" ? value : params.get("to");
    if (from && to && from > to)
      return setDateError("Ngày bắt đầu không được sau ngày kết thúc");
    setDateError("");
    update({ [key]: value });
  };

  const toggleStatus = async (r) => {
    const next = r.status === "APPROVED" ? "HIDDEN" : "APPROVED";
    if (
      next === "HIDDEN" &&
      !window.confirm(
        "Ẩn đánh giá này? Khách sẽ không thấy và điểm trung bình sẽ được tính lại.",
      )
    )
      return;
    setMsg({ type: "", text: "" });
    try {
      await dispatch(setReviewStatus({ id: r.id, status: next })).unwrap();
      setSelected((cur) =>
        cur && cur.id === r.id ? { ...cur, status: next } : cur,
      );
      setMsg({
        type: "success",
        text: next === "HIDDEN" ? "Đã ẩn đánh giá" : "Đã hiện lại đánh giá",
      });
      load();
    } catch (e) {
      setMsg({ type: "error", text: errText(e) });
    }
  };

  const remove = async (r) => {
    if (
      !window.confirm(
        "XÓA VĨNH VIỄN đánh giá này? Không thể khôi phục. Nên dùng Ẩn nếu chỉ muốn khách không thấy.",
      )
    )
      return;
    setMsg({ type: "", text: "" });
    try {
      await dispatch(deleteAdminReview(r.id)).unwrap();
      setSelected(null);
      setMsg({ type: "success", text: "Đã xóa đánh giá" });
      if (list.items.length === 1 && list.page > 1)
        update({ page: list.page - 1 });
      else load();
    } catch (e) {
      setMsg({
        type: "error",
        text: e?.message || "Có lỗi xảy ra, vui lòng thử lại",
      });
    }
  };

  const hasFilter = [...params.keys()].some((k) => k !== "page");

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Quản lý đánh giá</h2>

      <div className="mb-4 flex flex-wrap items-end gap-3">
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
            placeholder="Sản phẩm, tên hoặc email khách..."
            className="w-64 rounded-l border px-3 py-2 outline-none"
          />
          <button className="rounded-r bg-amber-900 px-4 text-white">
            Tìm
          </button>
        </form>

        <select
          value={params.get("rating") || ""}
          onChange={(e) => update({ rating: e.target.value })}
          className="rounded border px-3 py-2"
        >
          <option value="">Mọi số sao</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} sao
            </option>
          ))}
        </select>

        <select
          value={params.get("status") || ""}
          onChange={(e) => update({ status: e.target.value })}
          className="rounded border px-3 py-2"
        >
          <option value="">Mọi trạng thái</option>
          <option value="APPROVED">hiển thị</option>
          <option value="HIDDEN">Đã ẩn</option>
        </select>

        <label className="text-sm text-stone-600">
          Từ
          <input
            type="date"
            value={params.get("from") || ""}
            onChange={(e) => changeDate("from", e.target.value)}
            className="ml-1 rounded border px-2 py-1.5"
          />
        </label>
        <label className="text-sm text-stone-600">
          Đến
          <input
            type="date"
            value={params.get("to") || ""}
            onChange={(e) => changeDate("to", e.target.value)}
            className="ml-1 rounded border px-2 py-1.5"
          />
        </label>

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

        {hasFilter && (
          <button
            onClick={() => {
              setParams({});
              setDateError("");
            }}
            className="text-sm text-amber-900 underline"
          >
            Xóa bộ lọc
          </button>
        )}
        <span className="ml-auto text-sm text-stone-500">
          {list.total} đánh giá
        </span>
      </div>

      <Notice type="error">{dateError}</Notice>
      <Notice type={msg.type}>{msg.text}</Notice>
      {list.status === "failed" && (
        <p className="mb-3 text-red-600">{list.error}</p>
      )}

      <div
        className={`overflow-x-auto rounded-lg border bg-white ${list.status === "loading" ? "opacity-60" : ""}`}
      >
        <table className="w-full text-sm">
          <thead className="bg-stone-100 text-left">
            <tr>
              <th className="p-3">Sản phẩm</th>
              <th className="p-3">Người đánh giá</th>
              <th className="p-3">Sao</th>
              <th className="p-3">Nội dung</th>
              <th className="p-3">Ngày</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.items.length === 0 && list.status !== "loading" && (
              <tr>
                <td colSpan="7" className="p-6 text-center text-stone-500">
                  Không có đánh giá nào
                </td>
              </tr>
            )}
            {list.items.map((r) => (
              <tr
                key={r.id}
                onClick={() => setSelected(r)}
                className="cursor-pointer border-t align-top hover:bg-stone-50"
              >
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={cld(r.product_image, "w_80,f_auto,q_auto")}
                      alt=""
                      className="h-10 w-10 object-contain"
                    />
                    <span className="line-clamp-2 max-w-[11rem]">
                      {r.product_name}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  {r.user_name}
                  <div className="text-xs text-stone-500">{r.user_email}</div>
                </td>
                <td className="p-3">
                  <Stars value={r.rating} />
                </td>
                <td className="max-w-xs p-3">
                  <span className="line-clamp-2 text-stone-700">
                    {r.comment || (
                      <em className="text-stone-400">(không có nhận xét)</em>
                    )}
                  </span>
                </td>
                <td className="whitespace-nowrap p-3 text-stone-500">
                  {new Date(r.created_at).toLocaleDateString("vi-VN")}
                </td>
                <td className="p-3">
                  <StatusBadge active={r.status === "APPROVED"} />
                </td>
                <td
                  className="space-x-3 whitespace-nowrap p-3 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => toggleStatus(r)}
                    className={
                      r.status === "APPROVED"
                        ? "text-red-600 underline"
                        : "text-green-700 underline"
                    }
                  >
                    {r.status === "APPROVED" ? (
                      <Eye />
                    ) : (
                      <i className="pi pi-eye-slash" />
                    )}
                  </button>
                  <button
                    onClick={() => remove(r)}
                    className="text-stone-500 underline"
                  >
                    <Trash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={list.page}
        totalPages={list.totalPages}
        onChange={(n) => update({ page: n })}
      />

      {selected && (
        <Modal title="Chi tiết đánh giá" wide onClose={() => setSelected(null)}>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <img
                src={cld(selected.product_image, "w_120,f_auto,q_auto")}
                alt=""
                className="h-16 w-16 object-contain"
              />
              <div>
                <Link
                  to={`/products/${selected.product_id}`}
                  target="_blank"
                  className="font-medium text-amber-900 hover:underline"
                >
                  {selected.product_name}
                </Link>
                <div className="mt-1 flex items-center gap-2">
                  <Stars value={selected.rating} size="text-base" />
                  <StatusBadge active={selected.status === "APPROVED"} />
                </div>
              </div>
            </div>

            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <dt className="text-stone-500">Người đánh giá</dt>
              <dd>
                {selected.user_name} ({selected.user_email})
              </dd>
              <dt className="text-stone-500">Ngày đăng</dt>
              <dd>{fmt(selected.created_at)}</dd>
              <dt className="text-stone-500">Cập nhật</dt>
              <dd>{fmt(selected.updated_at)}</dd>
            </dl>

            <p className="whitespace-pre-line break-words rounded border bg-stone-50 p-3 text-stone-700">
              {selected.comment || "(Khách không viết nhận xét)"}
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => toggleStatus(selected)}
                className={`rounded border px-4 py-2 ${selected.status === "APPROVED" ? "border-red-600 text-red-600" : "border-green-700 text-green-700"}`}
              >
                {selected.status === "APPROVED" ? "Ẩn đánh giá" : "Hiện lại"}
              </button>
              <button
                onClick={() => remove(selected)}
                className="rounded border px-4 py-2 text-stone-600"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

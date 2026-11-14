import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  clearMine,
  deleteMyReview,
  fetchMyReview,
  fetchReviews,
  saveMyReview,
} from "../redux/slices/reviewSlice";

import { useAuth } from "../hooks/useAuth";
import { errText } from "../util/product";

import Stars from "./Stars";
import StarPicker from "./StarPicker";
import Pagination from "./Panigation";

const MAX_COMMENT = 1000;

export default function ReviewSection({ productId }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();

  const { list, summary, mine, forId } = useSelector((state) => state.reviews);

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isCurrentProduct = String(forId) === String(productId);

  const currentList = isCurrentProduct
    ? list
    : {
        items: [],
        total: 0,
        page: 1,
        limit: 5,
        totalPages: 0,
        status: "loading",
        error: "",
      };

  const currentSummary = isCurrentProduct
    ? summary
    : {
        average: null,
        count: 0,
        distribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      };

  const currentMine = isCurrentProduct
    ? mine
    : {
        data: null,
        status: "loading",
      };

  useEffect(() => {
    if (!productId) return;

    dispatch(
      fetchReviews({
        productId,
        page: 1,
        limit: 5,
      }),
    );
  }, [dispatch, productId]);

  useEffect(() => {
    if (!productId) return;

    if (user?.id) {
      dispatch(fetchMyReview(productId));
    } else {
      dispatch(clearMine());
    }
  }, [dispatch, productId, user?.id]);


  const reloadList = async () => {
    await dispatch(
      fetchReviews({
        productId,
        page: 1,
        limit: 5,
      }),
    ).unwrap();
  };

  const openForm = () => {
    if (!user) {
      navigate("/login", {
        state: {
          from: location.pathname,
        },
      });
      return;
    }

    if (currentMine.status === "loading") return;

    setRating(currentMine.data?.rating || 0);
    setComment(currentMine.data?.comment || "");

    setError("");
    setNotice("");
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (saving) return;

    if (!rating) {
      setError("Vui lòng chọn số sao");
      return;
    }

    const trimmedComment = comment.trim();

    if (trimmedComment.length > MAX_COMMENT) {
      setError(`Nhận xét tối đa ${MAX_COMMENT} ký tự`);
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await dispatch(
        saveMyReview({
          productId,
          rating,
          comment: trimmedComment,
        }),
      ).unwrap();

      await reloadList();

      setOpen(false);
      setNotice("Cảm ơn bạn đã đánh giá!");
    } catch (err) {
      setError(errText(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (deleting || saving) return;

    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa đánh giá của mình?",
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");
    setNotice("");

    try {
      await dispatch(deleteMyReview(productId)).unwrap();

      await reloadList();

      setRating(0);
      setComment("");
      setOpen(false);

      setNotice("Đã xóa đánh giá thành công!");
    } catch (err) {
      setError(errText(err));
    } finally {
      setDeleting(false);
    }
  };
  const distribution = currentSummary.distribution;

  const max = Math.max(1, ...Object.values(distribution));

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-center gap-6">
        <div className="text-center min-w-[120px]">
          <p className="text-4xl font-bold">{currentSummary.average ?? "—"}</p>

          <div className="flex justify-center mt-1">
            <Stars value={currentSummary.average || 0} />
          </div>

          <p className="text-xs text-stone-500 mt-1">
            ({currentSummary.count} khách hàng đánh giá)
          </p>
        </div>

        <div className="flex-1 min-w-[200px] max-w-sm space-y-1">
          {[5, 4, 3, 2, 1].map((n) => (
            <div key={n} className="flex items-center gap-2 text-xs">
              <span className="w-6">{n} ★</span>

              <div className="flex-1 h-2 bg-stone-200 rounded overflow-hidden">
                <div
                  className="h-full bg-yellow-500 transition-all duration-300"
                  style={{
                    width: `${(distribution[n] / max) * 100}%`,
                  }}
                />
              </div>

              <span className="w-6 text-right text-stone-500">
                {distribution[n]}
              </span>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={openForm}
          disabled={currentMine.status === "loading"}
          className="ml-auto px-5 py-2 bg-amber-900 text-white rounded hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentMine.status === "loading"
            ? "Đang tải..."
            : currentMine.data
              ? "Sửa đánh giá"
              : "Viết đánh giá"}
        </button>
      </div>
      {notice && (
        <p className="p-3 rounded bg-green-50 text-green-700 text-sm">
          {notice}
        </p>
      )}
      {open && (
        <form
          onSubmit={submit}
          className="border rounded-lg bg-white p-4 space-y-3"
        >
          <h3 className="font-semibold text-stone-800">
            {currentMine.data ? "Chỉnh sửa đánh giá" : "Viết đánh giá sản phẩm"}
          </h3>

          <StarPicker
            value={rating}
            onChange={setRating}
            disabled={saving || deleting}
          />

          <textarea
            rows={4}
            value={comment}
            maxLength={MAX_COMMENT}
            disabled={saving || deleting}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ cảm nhận của bạn (không bắt buộc)"
            className="w-full border rounded px-3 py-2 outline-none focus:border-amber-800 disabled:bg-stone-100"
          />

          <p className="text-xs text-stone-500 text-right">
            {comment.length}/{MAX_COMMENT}
          </p>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={saving || deleting}
              className="px-5 py-2 bg-amber-900 text-white rounded hover:bg-amber-800 disabled:opacity-60"
            >
              {saving
                ? "Đang gửi..."
                : currentMine.data
                  ? "Cập nhật đánh giá"
                  : "Gửi đánh giá"}
            </button>

            <button
              type="button"
              disabled={saving || deleting}
              onClick={() => {
                setOpen(false);
                setError("");
              }}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Hủy
            </button>

            {currentMine.data && (
              <button
                type="button"
                disabled={saving || deleting}
                onClick={remove}
                className="ml-auto text-red-600 underline disabled:opacity-50"
              >
                {deleting ? "Đang xóa..." : "Xóa đánh giá của tôi"}
              </button>
            )}
          </div>
        </form>
      )}
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3">Đánh giá sản phẩm</h3>

        {!isCurrentProduct || currentList.status === "loading" ? (
          <p className="text-stone-500">Đang tải đánh giá...</p>
        ) : currentList.status === "failed" ? (
          <p className="text-red-600">{currentList.error}</p>
        ) : currentList.items.length === 0 ? (
          <p className="text-stone-500">Chưa có đánh giá nào</p>
        ) : (
          <ul className="space-y-4">
            {currentList.items.map((r) => (
              <li key={r.id} className="border-b pb-4">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-medium text-stone-800">{r.author}</span>

                  <Stars value={r.rating} />

                  <span className="text-stone-400 text-xs">
                    {new Date(r.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>

                {r.comment && (
                  <p className="mt-2 text-stone-700 whitespace-pre-line break-words">
                    {r.comment}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
        {isCurrentProduct && currentList.totalPages > 1 && (
          <div className="mt-5">
            <Pagination
              page={currentList.page}
              totalPages={currentList.totalPages}
              onChange={(page) => {
                dispatch(
                  fetchReviews({
                    productId,
                    page,
                    limit: 5,
                  }),
                );
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

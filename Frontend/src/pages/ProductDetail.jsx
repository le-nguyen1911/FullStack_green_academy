import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  clearDetail,
  fetchProductDetail,
  fetchRelated,
} from "../redux/slices/productSlice";
import { useAuth } from "../hooks/useAuth";
import { GRIND_LABELS, formatVND } from "../util/format";
import { toArray } from "../util/product";
import Stars from "../components/Stars";
import ProductDetailTabs from "../components/ProductDetailTabs";
import RelatedProducts from "@/components/RelatedProducts";
export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data, status, error } = useSelector((s) => s.products.detail);
  const [imgIdx, setImgIdx] = useState(0);
  const [variantId, setVariantId] = useState(null);
  const [qty, setQty] = useState(1);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    dispatch(fetchProductDetail(id));
    dispatch(fetchRelated(id));

    setImgIdx(0);
    setVariantId(null);
    setQty(1);
    setNotice("");

    return () => {
      dispatch(clearDetail());
    };
  }, [dispatch, id]);

  if (status === "failed")
    return (
      <div className="max-w-3xl mx-auto p-10 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/products" className="text-amber-900 underline">
          Quay lại danh sách
        </Link>
      </div>
    );

  const p = data?.id === id ? data : null;
  if (!p) return <div className="p-10 text-center">Đang tải...</div>;

  const images = [
    ...new Set([p.image_url, ...toArray(p.images)].filter(Boolean)),
  ];
  const variants = p.variants || [];
  const selected =
    variants.find((v) => v.id === variantId) ??
    variants.find((v) => v.quantity > 0) ??
    variants[0];
  const max = selected ? Math.min(99, selected.quantity) : 0;
  const safeQty = Math.min(Math.max(qty, 1), Math.max(max, 1));

  const addToCart = () => {
    if (!user)
      return navigate("/login", { state: { from: location.pathname } });
    setNotice("Chức năng giỏ hàng sẽ được nối ở bước tiếp theo");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <p className="text-xl text-stone-500 mb-4">
        <Link
          to="/products"
          className="no-underline! font-bold! text-black! hover:text-amber-900! "
        >
          Sản phẩm
        </Link>{" "}
        / {p.category_name} / {p.name}
      </p>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="border rounded-lg bg-white p-4">
            <img
              src={images[imgIdx]}
              alt={p.name}
              className="w-full h-96 object-contain"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setImgIdx(i)}
                  className={`border rounded p-1 bg-white ${i === imgIdx ? "border-amber-900" : ""}`}
                >
                  <img src={src} alt="" className="w-16 h-16 object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">{p.name}</h1>
          <div className="flex items-center gap-3 text-sm text-stone-500">
            <Stars value={p.avg_rating} />
            <span>{p.brand_name}</span>
            <span>{p.category_name}</span>
          </div>

          {selected ? (
            <p className="text-3xl font-bold text-red-700">
              {formatVND(selected.price)}
            </p>
          ) : (
            <p className="text-stone-500">Sản phẩm chưa có giá bán</p>
          )}

          {variants.length > 0 && (
            <div>
              <p className="font-medium mb-2">Phân loại</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setVariantId(v.id);
                      setQty(1);
                      setNotice("");
                    }}
                    className={`px-3 py-2 border rounded text-sm ${
                      v.id === selected?.id
                        ? "border-amber-900 bg-amber-50"
                        : "bg-white"
                    } ${v.quantity === 0 ? "opacity-50" : ""}`}
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
            </div>
          )}

          {selected && (
            <>
              <p className="text-sm text-stone-600">
                {max === 0 ? (
                  <span className="text-red-600">Hết hàng</span>
                ) : (
                  `Còn ${selected.quantity} sản phẩm`
                )}
                {selected.sku && (
                  <span className="ml-4">SKU: {selected.sku}</span>
                )}
              </p>

              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded bg-white">
                  <button
                    disabled={safeQty <= 1}
                    onClick={() => setQty(safeQty - 1)}
                    className="w-9 h-9 disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-10 text-center">{safeQty}</span>
                  <button
                    disabled={safeQty >= max}
                    onClick={() => setQty(safeQty + 1)}
                    className="w-9 h-9 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <button
                  disabled={max === 0}
                  onClick={addToCart}
                  className="px-6 py-2 bg-amber-900 text-white rounded hover:bg-amber-800 disabled:opacity-50"
                >
                  Thêm vào giỏ
                </button>
              </div>
            </>
          )}

          {notice && (
            <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
              {notice}
            </p>
          )}
          {p.description && (
            <p className="text-stone-700 whitespace-pre-line pt-4 border-t"></p>
          )}
        </div>
      </div>
      <ProductDetailTabs
        description={p?.description || ""}
        productId={id}
      />
      <RelatedProducts/>
    </div>
  );
}

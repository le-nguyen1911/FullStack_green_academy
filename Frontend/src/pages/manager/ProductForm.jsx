import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  clearManagerDetail, createProduct, fetchManagerProduct, fetchOptions, setProductStatus, updateProduct,
} from "../../redux/slices/managerProductSlice";
import { useAuth } from "../../hooks/useAuth";
import { GRIND_LABELS } from "../../util/format";
import { emptyVariant, errText, toArray, toVariantBody } from "../../util/product";
import ImageUploader from "../../components/product/ImageUploader";
import VariantManager from "../../components/product/VariantManager";
import Notice from "../../components/manager/Notice";
import StatusBadge from "../../components/manager/StatusBadge";

const input = "w-full rounded border px-3 py-2 outline-none focus:border-amber-800 disabled:bg-stone-100";

// Trang dùng chung cho THÊM MỚI (/manager/products/new) và SỬA (/manager/products/:id)
export default function ProductForm() {
  const { id } = useParams();
  const isNew = !id;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();
  const canUpdate = isNew || hasPermission("product:update");

  const detail = useSelector((s) => s.managerProducts.detail);
  const { categories, brands } = useSelector((s) => s.managerProducts.options);

  const [form, setForm] = useState({ name: "", category_id: "", brand_id: "", description: "", image_url: "", images: [] });
  const [variants, setVariants] = useState([{ ...emptyVariant }]);   
  const [error, setError] = useState("");
  const [ok, setOk] = useState(location.state?.message || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);                    
  const trackUpload = (busy) => setUploading((n) => n + (busy ? 1 : -1));

  useEffect(() => { dispatch(fetchOptions()); }, [dispatch]);

  useEffect(() => {
    if (!isNew) dispatch(fetchManagerProduct(id));
    return () => { dispatch(clearManagerDetail()); };
  }, [dispatch, id, isNew]);

  const product = !isNew && detail.data?.id === id ? detail.data : null;

  useEffect(() => {
    if (!product) return;
    setForm({
      name: product.name || "",
      category_id: product.category_id || "",
      brand_id: product.brand_id || "",
      description: product.description || "",
      image_url: product.image_url || "",
      images: toArray(product.images),
    });
  }, [product?.id]); 

  const setField = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const setVariant = (i, patch) => setVariants((vs) => vs.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  const reload = () => dispatch(fetchManagerProduct(id));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(""); setOk("");
    if (!form.name.trim()) return setError("Vui lòng nhập tên sản phẩm");
    if (!form.category_id || !form.brand_id) return setError("Vui lòng chọn danh mục và thương hiệu");
    if (uploading > 0) return setError("Vui lòng chờ ảnh tải xong");

    const body = {
      name: form.name.trim(),
      category_id: form.category_id,
      brand_id: form.brand_id,
      description: form.description.trim() || null,
      image_url: form.image_url || null,
      images: form.images,
    };

    setSaving(true);
    try {
      if (isNew) {
        const rows = variants.filter((v) => v.variant_name.trim() || v.sku.trim() || v.price !== "");
        for (const v of rows)
          if (!v.variant_name.trim() || !v.sku.trim() || v.price === "")
            throw new Error("Mỗi biến thể cần đủ tên, SKU và giá");

        const { id: newId } = await dispatch(createProduct({ ...body, variants: rows.map(toVariantBody) })).unwrap();
        navigate(`/manager/products/${newId}`, { replace: true, state: { message: "Đã tạo sản phẩm" } });
      } else {
        await dispatch(updateProduct({ id, body })).unwrap();
        await reload();
        setOk("Đã lưu thay đổi");
      }
    } catch (err) {
      setError(errText(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (status) => {
    if (!status && !window.confirm("Ẩn sản phẩm này?")) return;
    setError(""); setOk("");
    try {
      await dispatch(setProductStatus({ id, status })).unwrap();
      await reload();
      setOk(status ? "Đã khôi phục sản phẩm" : "Đã ẩn sản phẩm");
    } catch (err) {
      setError(errText(err));
    }
  };

  if (!isNew && detail.status === "failed")
    return <p className="text-red-600">{detail.error} <Link to="/manager/products" className="underline">Quay lại</Link></p>;
  if (!isNew && !product) return <p>Đang tải...</p>;

  const active = product ? Boolean(product.status) : true;
  const catMissing = product && !categories.some((c) => c.id === form.category_id);
  const brandMissing = product && !brands.some((b) => b.id === form.brand_id);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/manager/products" className="text-sm text-stone-500 hover:underline">← Danh sách</Link>
        <h2 className="text-xl font-semibold">{isNew ? "Thêm sản phẩm" : "Sửa sản phẩm"}</h2>
        {!isNew && <StatusBadge active={active} on="Đang bán" />}
        <div className="ml-auto space-x-2">
          {!isNew && active && hasPermission("product:delete") && (
            <button onClick={() => toggleStatus(false)} className="rounded border border-red-600 px-3 py-1 text-red-600">Ẩn</button>
          )}
          {!isNew && !active && hasPermission("product:update") && (
            <button onClick={() => toggleStatus(true)} className="rounded border border-green-700 px-3 py-1 text-green-700">Khôi phục</button>
          )}
        </div>
      </div>

      <Notice type="error">{error}</Notice>
      <Notice type="success">{ok}</Notice>

      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border bg-white p-6">
        <div>
          <label className="mb-1 block font-medium">Tên sản phẩm *</label>
          <input name="name" value={form.name} onChange={setField} disabled={!canUpdate} className={input} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-medium">Danh mục *</label>
            <select name="category_id" value={form.category_id} onChange={setField} disabled={!canUpdate} className={input}>
              <option value="">— Chọn —</option>
              {catMissing && <option value={form.category_id}>{product.category_name} (đã ẩn)</option>}
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-medium">Thương hiệu *</label>
            <select name="brand_id" value={form.brand_id} onChange={setField} disabled={!canUpdate} className={input}>
              <option value="">— Chọn —</option>
              {brandMissing && <option value={form.brand_id}>{product.brand_name} (đã ẩn)</option>}
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block font-medium">Mô tả</label>
          <textarea name="description" rows="4" value={form.description} onChange={setField} disabled={!canUpdate} className={input} />
        </div>

        <div>
          <label className="mb-1 block font-medium">Ảnh đại diện</label>
          <ImageUploader value={form.image_url ? [form.image_url] : []} max={1} disabled={!canUpdate} onBusyChange={trackUpload}
                         onChange={(arr) => setForm((f) => ({ ...f, image_url: arr[0] || "" }))} />
        </div>

        <div>
          <label className="mb-1 block font-medium">Ảnh phụ</label>
          <ImageUploader value={form.images} max={10} disabled={!canUpdate} onBusyChange={trackUpload}
                         onChange={(arr) => setForm((f) => ({ ...f, images: arr }))} />
        </div>

        {isNew && (
          <div className="space-y-3">
            <p className="font-medium">Biến thể</p>
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-2 items-center gap-2 md:grid-cols-7">
                <input placeholder="Tên biến thể" value={v.variant_name} onChange={(e) => setVariant(i, { variant_name: e.target.value })} className={`${input} md:col-span-2`} />
                <input placeholder="SKU" value={v.sku} onChange={(e) => setVariant(i, { sku: e.target.value })} className={input} />
                <select value={v.grind_type} onChange={(e) => setVariant(i, { grind_type: e.target.value })} className={input}>
                  {Object.entries(GRIND_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                </select>
                <input type="number" min="0" placeholder="Giá" value={v.price} onChange={(e) => setVariant(i, { price: e.target.value })} className={input} />
                <input type="number" min="0" placeholder="Tồn kho" value={v.quantity} onChange={(e) => setVariant(i, { quantity: e.target.value })} className={input} />
                <button type="button" disabled={variants.length === 1}
                        onClick={() => setVariants((vs) => vs.filter((_, idx) => idx !== i))}
                        className="text-red-600 disabled:opacity-30">Xóa dòng</button>
              </div>
            ))}
            <button type="button" onClick={() => setVariants((vs) => [...vs, { ...emptyVariant }])}
                    className="text-sm text-amber-900 underline">+ Thêm biến thể</button>
          </div>
        )}

        {canUpdate && (
          <button disabled={saving || uploading > 0} className="rounded bg-amber-900 px-6 py-2 text-white hover:bg-amber-800 disabled:opacity-60">
            {saving ? "Đang lưu..." : uploading > 0 ? "Đang tải ảnh..." : isNew ? "Tạo sản phẩm" : "Lưu thay đổi"}
          </button>
        )}
      </form>

      {!isNew && product && <VariantManager product={product} onChanged={reload} />}
    </div>
  );
}

import { useState } from "react";
import { useDispatch } from "react-redux";
import { addVariant, adjustStock, setVariantStatus, updateVariant } from "../../redux/slices/managerProductSlice";
import { useAuth } from "../../hooks/useAuth";
import { GRIND_LABELS, formatVND } from "../../util/format";
import { emptyVariant, errText, toVariantBody } from "../../util/product";

const cell = "rounded border px-2 py-1";

// Mỗi nút chỉ hiện khi người dùng có ĐÚNG quyền (backend vẫn kiểm tra lại, đây chỉ để gọn giao diện)
export default function VariantManager({ product, onChanged }) {
  const dispatch = useDispatch();
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission("product:update");
  const canDelete = hasPermission("product:delete");
  const canStock = hasPermission("product:stock");

  const [edits, setEdits] = useState({});   // { [variantId]: { price, delta } }
  const [newV, setNewV] = useState({ ...emptyVariant });
  const [msg, setMsg] = useState({ type: "", text: "" });

  const edit = (vid, patch) => setEdits((p) => ({ ...p, [vid]: { ...p[vid], ...patch } }));
  const fail = (text) => setMsg({ type: "danger", text });

  // Chạy một thunk, thành công thì tải lại sản phẩm. Trả true/false
  const run = async (action, okText) => {
    setMsg({ type: "", text: "" });
    try {
      await dispatch(action).unwrap();
      await onChanged();
      setMsg({ type: "success", text: okText });
      return true;
    } catch (e) {
      fail(errText(e));
      return false;
    }
  };

  const savePrice = async (v) => {
    const raw = edits[v.id]?.price;
    if (raw === undefined || raw === "" || Number(raw) < 0) return fail("Giá không hợp lệ");
    if (await run(updateVariant({ variantId: v.id, body: { price: Number(raw) } }), "Đã cập nhật giá"))
      edit(v.id, { price: undefined });
  };

  const applyStock = async (v) => {
    const delta = Number(edits[v.id]?.delta);
    if (!Number.isInteger(delta) || delta === 0) return fail("Nhập số nguyên khác 0 (dương: nhập thêm, âm: xuất bớt)");
    if (await run(adjustStock({ variantId: v.id, delta }), "Đã cập nhật tồn kho")) edit(v.id, { delta: "" });
  };

  const toggle = (v) => {
    const active = Boolean(v.status);
    if (active && !window.confirm(`Ẩn biến thể "${v.variant_name}"?`)) return;
    run(setVariantStatus({ variantId: v.id, status: !active }), active ? "Đã ẩn biến thể" : "Đã khôi phục biến thể");
  };

  const add = async () => {
    if (!newV.variant_name.trim() || !newV.sku.trim() || newV.price === "")
      return fail("Biến thể mới cần đủ tên, SKU và giá");
    if (await run(addVariant({ productId: product.id, body: toVariantBody(newV) }), "Đã thêm biến thể"))
      setNewV({ ...emptyVariant });
  };

  return (
    <div className="space-y-4 rounded-lg border bg-white p-6">
      <h3 className="font-semibold">Biến thể và tồn kho</h3>

      {msg.text && (
        <p className={`rounded p-2 text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {msg.text}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-100 text-left">
            <tr><th className="p-2">Biến thể</th><th className="p-2">SKU</th><th className="p-2">Giá</th><th className="p-2">Tồn kho</th><th className="p-2">Trạng thái</th></tr>
          </thead>
          <tbody>
            {product.variants.map((v) => {
              const active = Boolean(v.status);   // MySQL trả 1/0
              return (
                <tr key={v.id} className="border-t align-top">
                  <td className="p-2">
                    {v.variant_name}
                    <div className="text-xs text-stone-500">{GRIND_LABELS[v.grind_type]}{v.weight_grams ? ` · ${v.weight_grams}g` : ""}</div>
                  </td>
                  <td className="p-2">{v.sku}</td>

                  <td className="p-2">
                    {canUpdate ? (
                      <div className="flex gap-1">
                        <input type="number" min="0" value={edits[v.id]?.price ?? v.price}
                               onChange={(e) => edit(v.id, { price: e.target.value })} className={`${cell} w-28`} />
                        <button onClick={() => savePrice(v)} className="rounded bg-stone-800 px-2 text-white">Lưu</button>
                      </div>
                    ) : formatVND(v.price)}
                  </td>

                  <td className="p-2">
                    <span className="font-medium">{v.quantity}</span>
                    {canStock && (
                      <div className="mt-1 flex gap-1">
                        <input type="number" placeholder="+10 / -3" value={edits[v.id]?.delta ?? ""}
                               onChange={(e) => edit(v.id, { delta: e.target.value })} className={`${cell} w-24`} />
                        <button onClick={() => applyStock(v)} className="rounded bg-stone-800 px-2 text-white">Áp dụng</button>
                      </div>
                    )}
                  </td>

                  <td className="space-y-1 p-2">
                    <span className={`rounded px-2 py-0.5 text-xs ${active ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-600"}`}>
                      {active ? "Đang bán" : "Đã ẩn"}
                    </span>
                    <div>
                      {active && canDelete && <button onClick={() => toggle(v)} className="text-red-600 underline">Ẩn</button>}
                      {!active && canUpdate && <button onClick={() => toggle(v)} className="text-green-700 underline">Khôi phục</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
            {product.variants.length === 0 && (
              <tr><td colSpan="5" className="p-4 text-center text-stone-500">
                Chưa có biến thể. Khách sẽ không thấy sản phẩm này cho tới khi có ít nhất một biến thể đang bán.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {canUpdate && (
        <div className="border-t pt-4">
          <p className="mb-2 font-medium">Thêm biến thể</p>
          <div className="grid grid-cols-2 items-center gap-2 md:grid-cols-7">
            <input placeholder="Tên biến thể" value={newV.variant_name} onChange={(e) => setNewV({ ...newV, variant_name: e.target.value })} className={`${cell} md:col-span-2`} />
            <input placeholder="SKU" value={newV.sku} onChange={(e) => setNewV({ ...newV, sku: e.target.value })} className={cell} />
            <select value={newV.grind_type} onChange={(e) => setNewV({ ...newV, grind_type: e.target.value })} className={cell}>
              {Object.entries(GRIND_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
            <input type="number" min="0" placeholder="Giá" value={newV.price} onChange={(e) => setNewV({ ...newV, price: e.target.value })} className={cell} />
            <input type="number" min="0" placeholder="Tồn kho" value={newV.quantity} onChange={(e) => setNewV({ ...newV, quantity: e.target.value })} className={cell} />
            <button onClick={add} className="rounded bg-amber-900 px-3 py-1 text-white">Thêm</button>
          </div>
        </div>
      )}
    </div>
  );
}

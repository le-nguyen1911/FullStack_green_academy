export const emptyVariant = {
  variant_name: "",
  sku: "",
  weight_grams: "",
  grind_type: "WHOLE_BEAN",
  price: "",
  quantity: "0",
};

export const toVariantBody = (v) => ({
  variant_name: v.variant_name.trim(),
  sku: v.sku.trim(),
  weight_grams: v.weight_grams === "" ? null : Number(v.weight_grams),
  grind_type: v.grind_type,
  price: Number(v.price),
  quantity: v.quantity === "" ? 0 : Number(v.quantity),
});

export const toArray = (v) => {
  if (Array.isArray(v)) return v;
  try {
    const x = JSON.parse(v);
    return Array.isArray(x) ? x : [];
  } catch {
    return [];
  }
};

export const errText = (e) =>
  typeof e === "string" ? e : e?.message || "Có lỗi xảy ra";

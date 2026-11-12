const AppError = require("../utils/AppError");
const withTransaction = require("../utils/transaction");
const productModel = require("../models/product.model");
const uploadService = require("./upload.service");

const GRIND_TYPES = ["WHOLE_BEAN", "FINE", "MEDIUM", "COARSE"];
const SORT_KEYS = ["newest", "price_asc", "price_desc", "name_asc"];
const STATUS_KEYS = ["all", "active", "inactive"];
const readIds = (v) =>
  v
    ? String(v)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 20)
    : [];

const readPrice = (v) => {
  if (v === undefined || v === "") return undefined;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0)
    throw new AppError(400, "Giá lọc phải là số >= 0");
  return n;
};

const readListQuery = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 12, 1), 50);
  const minPrice = readPrice(query.min_price);
  const maxPrice = readPrice(query.max_price);
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice)
    throw new AppError(400, "min_price không được lớn hơn max_price");

  return {
    page,
    limit,
    offset: (page - 1) * limit,
    sort: SORT_KEYS.includes(query.sort) ? query.sort : "newest",
    q: query.q?.trim().slice(0, 100) || undefined,
    categoryIds: readIds(query.category_id),
    brandIds: readIds(query.brand_id),
    minPrice,
    maxPrice,
  };
};

const NEW_DAYS = 30;

const decorate = (item) => ({
  ...item,
  avg_rating: item.avg_rating === null ? null : Number(item.avg_rating), // null = chưa có đánh giá
  is_new:
    Date.now() - new Date(item.created_at).getTime() <
    NEW_DAYS * 24 * 60 * 60 * 1000,
});

const toPage = ({ items, total }, p) => ({
  items: items.map(decorate),
  page: p.page,
  limit: p.limit,
  total,
  totalPages: Math.ceil(total / p.limit),
});

const assertImages = (images) => {
  if (!Array.isArray(images) || !images.every((u) => typeof u === "string"))
    throw new AppError(400, "images phải là mảng URL");
};

const assertVariant = (v) => {
  const fail = (msg) => {
    throw new AppError(400, msg);
  };
  if (!v.variant_name?.trim() || !v.sku?.trim())
    fail("Biến thể thiếu variant_name hoặc sku");
  if (!(Number(v.price) >= 0)) fail("price phải là số >= 0");
  if (
    v.quantity !== undefined &&
    !(Number.isInteger(v.quantity) && v.quantity >= 0)
  )
    fail("quantity phải là số nguyên >= 0");
  if (v.weight_grams != null && !(Number(v.weight_grams) > 0))
    fail("weight_grams phải > 0");
  if (v.grind_type && !GRIND_TYPES.includes(v.grind_type))
    fail(`grind_type phải là một trong ${GRIND_TYPES.join(", ")}`);
};

const assertProductFields = (b) => {
  if (b.name !== undefined && !String(b.name).trim())
    throw new AppError(400, "name không được rỗng");
  if (b.status !== undefined && typeof b.status !== "boolean")
    throw new AppError(400, "status phải là true/false");
  if (b.images !== undefined) assertImages(b.images);
};

const cleanVariant = (v) => ({
  ...v,
  variant_name: v.variant_name.trim(),
  sku: v.sku.trim(),
});

const listPublic = async (query) => {
  const p = readListQuery(query);
  return toPage(await productModel.list({ ...p, onlyActive: true }), p);
};

const getPublic = async (id) => {
  const product = await productModel.findDetail(id, true);
  if (!product) throw new AppError(404, "Không tìm thấy sản phẩm");
  return product;
};

const listManager = async (query) => {
  const p = readListQuery(query);
  const status = STATUS_KEYS.includes(query.status) ? query.status : "all";
  return toPage(
    await productModel.list({ ...p, onlyActive: false, status }),
    p,
  );
};

const getManager = async (id) => {
  const product = await productModel.findDetail(id, false);
  if (!product) throw new AppError(404, "Không tìm thấy sản phẩm");
  return product;
};

const create = async (body) => {
  const { category_id, brand_id, name, variants = [] } = body;
  if (!category_id || !brand_id || !name?.trim())
    throw new AppError(400, "Thiếu category_id, brand_id hoặc name");
  assertProductFields(body);
  if (!Array.isArray(variants))
    throw new AppError(400, "variants phải là mảng");
  variants.forEach(assertVariant);

  return withTransaction(async (conn) => {
    const id = await productModel.create({ ...body, name: name.trim() }, conn);
    for (const v of variants)
      await productModel.addVariant(id, cleanVariant(v), conn);
    return { id };
  });
};

const update = async (id, body) => {
  assertProductFields(body);
  await assertCatalogActive(body);
  const data = { ...body };
  if (data.name !== undefined) data.name = data.name.trim();

  const touchesImages =
    body.image_url !== undefined || body.images !== undefined;
  const before = touchesImages ? await productModel.getImages(id) : null;

  const affected = await productModel.update(id, data);
  if (affected === null)
    throw new AppError(400, "Không có dữ liệu để cập nhật");
  if (!affected && !(await productModel.exists(id)))
    throw new AppError(404, "Không tìm thấy sản phẩm");

  if (before) {
    const kept = new Set(imagesOf(await productModel.getImages(id)));
    const removed = imagesOf(before).filter((u) => !kept.has(u));
    if (removed.length)
      uploadService.destroyUnused(removed).catch(console.error);
  }
};

const remove = async (id) => {
  if (!(await productModel.softDelete(id)) && !(await productModel.exists(id)))
    throw new AppError(404, "Không tìm thấy sản phẩm");
};

const addVariant = async (productId, body) => {
  assertVariant(body);
  if (!(await productModel.exists(productId)))
    throw new AppError(404, "Không tìm thấy sản phẩm");
  return { id: await productModel.addVariant(productId, cleanVariant(body)) };
};

const updateVariant = async (variantId, b) => {
  if (b.price !== undefined && !(Number(b.price) >= 0))
    throw new AppError(400, "price phải là số >= 0");
  if (
    b.quantity !== undefined &&
    !(Number.isInteger(b.quantity) && b.quantity >= 0)
  )
    throw new AppError(400, "quantity phải là số nguyên >= 0");
  if (b.weight_grams != null && !(Number(b.weight_grams) > 0))
    throw new AppError(400, "weight_grams phải > 0");
  if (b.grind_type !== undefined && !GRIND_TYPES.includes(b.grind_type))
    throw new AppError(400, "grind_type không hợp lệ");
  if (b.status !== undefined && typeof b.status !== "boolean")
    throw new AppError(400, "status phải là true/false");

  const affected = await productModel.updateVariant(variantId, b);
  if (affected === null)
    throw new AppError(400, "Không có dữ liệu để cập nhật");
  if (!affected && (await productModel.getVariantQuantity(variantId)) === null)
    throw new AppError(404, "Không tìm thấy biến thể");
};

const removeVariant = async (variantId) => {
  if (
    !(await productModel.softDeleteVariant(variantId)) &&
    (await productModel.getVariantQuantity(variantId)) === null
  )
    throw new AppError(404, "Không tìm thấy biến thể");
};

const adjustStock = async (variantId, delta) => {
  if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 100000)
    throw new AppError(
      400,
      "delta phải là số nguyên khác 0 (từ -100000 đến 100000)",
    );

  return withTransaction(async (conn) => {
    const affected = await productModel.adjustStock(variantId, delta, conn);
    const quantity = await productModel.getVariantQuantity(variantId, conn);
    if (quantity === null) throw new AppError(404, "Không tìm thấy biến thể");
    if (!affected)
      throw new AppError(409, `Không đủ tồn kho (hiện còn ${quantity})`);
    return { variantId, delta, quantity };
  });
};

const getPriceRange = async () => {
  const [[row]] = await db.query(
    `SELECT MIN(v.price) AS min_price, MAX(v.price) AS max_price
     FROM product_variants v
     JOIN products p ON p.id = v.product_id
     JOIN categories c ON c.id = p.category_id
     JOIN brands b ON b.id = p.brand_id
     WHERE v.status = TRUE AND p.status = TRUE AND c.status = TRUE AND b.status = TRUE`,
  );
  return {
    min_price: Number(row.min_price ?? 0),
    max_price: Number(row.max_price ?? 0),
  };
};
const toList = (v) => {
  if (Array.isArray(v)) return v;
  try {
    const x = JSON.parse(v);
    return Array.isArray(x) ? x : [];
  } catch {
    return [];
  }
};
const imagesOf = (row) =>
  [row?.image_url, ...toList(row?.images)].filter(Boolean);
module.exports = {
  listPublic,
  getPublic,
  listManager,
  getManager,
  create,
  update,
  remove,
  addVariant,
  updateVariant,
  removeVariant,
  adjustStock,
  getPriceRange,
  imagesOf,
};

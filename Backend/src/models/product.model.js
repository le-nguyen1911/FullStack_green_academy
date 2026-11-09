const { randomUUID } = require("crypto");
const db = require("../config/database");

const PRODUCT_UPDATABLE = [
  "category_id",
  "brand_id",
  "name",
  "description",
  "image_url",
  "images",
  "status",
];
const VARIANT_UPDATABLE = [
  "variant_name",
  "weight_grams",
  "grind_type",
  "price",
  "quantity",
  "sku",
  "status",
];

const SORTS = {
  newest: "p.created_at DESC, p.id",
  name_asc: "p.name ASC, p.id",
  price_asc: "MIN(v.price) IS NULL, MIN(v.price) ASC, p.id",
  price_desc: "MIN(v.price) IS NULL, MIN(v.price) DESC, p.id",
};

const buildSet = (allowed, data) => {
  const sets = [];
  const params = [];
  for (const key of allowed) {
    if (data[key] === undefined) continue;
    sets.push(`${key} = ?`);
    params.push(key === "images" ? JSON.stringify(data[key]) : data[key]);
  }
  return { sets, params };
};

const list = async ({
  onlyActive,
  status,
  q,
  categoryIds = [],
  brandIds = [],
  minPrice,
  maxPrice,
  sort,
  limit,
  offset,
}) => {
  const where = [];
  const params = [];

  if (onlyActive) {
    where.push("p.status = TRUE");
    where.push(
      `EXISTS (SELECT 1 FROM product_variants x WHERE x.product_id = p.id AND x.status = TRUE)`,
    );
  } else if (status === "active") where.push("p.status = TRUE");
  else if (status === "inactive") where.push("p.status = FALSE");

  if (q) {
    where.push("p.name LIKE ?");
    params.push(`%${q.replace(/[\\%_]/g, "\\$&")}%`);
  }
  if (categoryIds.length) {
    where.push("p.category_id IN (?)");
    params.push(categoryIds);
  }
  if (brandIds.length) {
    where.push("p.brand_id IN (?)");
    params.push(brandIds);
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const conds = ["y.product_id = p.id", "y.status = TRUE"];
    if (minPrice !== undefined) {
      conds.push("y.price >= ?");
      params.push(minPrice);
    }
    if (maxPrice !== undefined) {
      conds.push("y.price <= ?");
      params.push(maxPrice);
    }
    where.push(
      `EXISTS (SELECT 1 FROM product_variants y WHERE ${conds.join(" AND ")})`,
    );
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM products p ${whereSql}`,
    params,
  );

  const [items] = await db.query(
    `SELECT p.id, p.name, p.image_url, p.status, p.created_at,
            p.category_id, c.name AS category_name,
            p.brand_id, b.name AS brand_name,
            MIN(v.price) AS min_price,
            MAX(v.price) AS max_price,
            COALESCE(SUM(v.quantity), 0) AS total_stock
     FROM products p
     JOIN categories c ON c.id = p.category_id
     JOIN brands b ON b.id = p.brand_id
     LEFT JOIN product_variants v ON v.product_id = p.id AND v.status = TRUE
     ${whereSql}
     GROUP BY p.id, c.name, b.name
     ORDER BY ${SORTS[sort] || SORTS.newest}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  return { items, total };
};

const findDetail = async (id, onlyActive) => {
  const [[product]] = await db.query(
    `SELECT p.*, c.name AS category_name, b.name AS brand_name
     FROM products p
     JOIN categories c ON c.id = p.category_id
     JOIN brands b ON b.id = p.brand_id
     WHERE p.id = ? ${onlyActive ? "AND p.status = TRUE" : ""}`,
    [id],
  );
  if (!product) return null;

  const [variants] = await db.query(
    `SELECT * FROM product_variants
     WHERE product_id = ? ${onlyActive ? "AND status = TRUE" : ""}
     ORDER BY price`,
    [id],
  );
  return { ...product, variants };
};

const exists = async (id) => {
  const [rows] = await db.query("SELECT 1 FROM products WHERE id = ?", [id]);
  return rows.length > 0;
};

const create = async (data, conn = db) => {
  const id = randomUUID();
  await conn.query(
    `INSERT INTO products (id, category_id, brand_id, name, description, image_url, images)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.category_id,
      data.brand_id,
      data.name,
      data.description || null,
      data.image_url || null,
      JSON.stringify(data.images || []),
    ],
  );
  return id;
};

const addVariant = async (productId, v, conn = db) => {
  const id = randomUUID();
  await conn.query(
    `INSERT INTO product_variants
       (id, product_id, variant_name, weight_grams, grind_type, price, quantity, sku)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      productId,
      v.variant_name,
      v.weight_grams ?? null,
      v.grind_type || "WHOLE_BEAN",
      v.price,
      v.quantity ?? 0,
      v.sku,
    ],
  );
  return id;
};

const update = async (id, data) => {
  const { sets, params } = buildSet(PRODUCT_UPDATABLE, data);
  if (!sets.length) return null;
  const [r] = await db.query(
    `UPDATE products SET ${sets.join(", ")} WHERE id = ?`,
    [...params, id],
  );
  return r.affectedRows;
};

const softDelete = async (id) => {
  const [r] = await db.query(
    "UPDATE products SET status = FALSE WHERE id = ?",
    [id],
  );
  return r.affectedRows;
};

const updateVariant = async (variantId, data) => {
  const { sets, params } = buildSet(VARIANT_UPDATABLE, data);
  if (!sets.length) return null;
  const [r] = await db.query(
    `UPDATE product_variants SET ${sets.join(", ")} WHERE id = ?`,
    [...params, variantId],
  );
  return r.affectedRows;
};

const softDeleteVariant = async (variantId) => {
  const [r] = await db.query(
    "UPDATE product_variants SET status = FALSE WHERE id = ?",
    [variantId],
  );
  return r.affectedRows;
};

const getVariantQuantity = async (variantId, conn = db) => {
  const [rows] = await conn.query(
    "SELECT quantity FROM product_variants WHERE id = ?",
    [variantId],
  );
  return rows.length ? rows[0].quantity : null;
};

const adjustStock = async (variantId, delta, conn = db) => {
  const [r] = await conn.query(
    "UPDATE product_variants SET quantity = quantity + ? WHERE id = ? AND quantity + ? >= 0",
    [delta, variantId, delta],
  );
  return r.affectedRows;
};

module.exports = {
  list,
  findDetail,
  exists,
  create,
  addVariant,
  update,
  softDelete,
  updateVariant,
  softDeleteVariant,
  getVariantQuantity,
  adjustStock,
};

const AppError = require("../utils/AppError");
const withTransaction = require("../utils/transaction");
const { toVnd } = require("../utils/money");
const cartModel = require("../models/cart.model");
const productModel = require("../models/product.model");

const MAX_PER_ITEM = 99;
const MAX_ITEMS = 50;

const readQuantity = (q) => {
  if (!Number.isInteger(q) || q < 1 || q > MAX_PER_ITEM)
    throw new AppError(
      400,
      `quantity phải là số nguyên từ 1 đến ${MAX_PER_ITEM}`,
    );
  return q;
};

const assertStock = (stock, wanted, inCart = 0) => {
  if (stock === 0) throw new AppError(409, "Sản phẩm đã hết hàng");
  if (wanted > stock)
    throw new AppError(
      409,
      inCart
        ? `Kho chỉ còn ${stock}, trong giỏ bạn đã có ${inCart}`
        : `Kho chỉ còn ${stock} sản phẩm`,
    );
};

const getCart = async (userId) => {
  const rows = await cartModel.listDetailedByUser(userId);

  const items = rows.map((r) => {
    const price = toVnd(r.price);
    const available = Boolean(r.available); 
    const inStock = r.stock >= r.quantity; 
    const purchasable = available && inStock; 
    return {
      id: r.id,
      variant_id: r.variant_id,
      product_id: r.product_id,
      product_name: r.product_name,
      variant_name: r.variant_name,
      image_url: r.image_url,
      price,
      quantity: r.quantity,
      stock: r.stock,
      max_quantity: Math.min(MAX_PER_ITEM, r.stock),
      available,
      in_stock: inStock,
      purchasable,
      line_total: purchasable ? price * r.quantity : 0,
    };
  });
  return {
    items,
    total_quantity: items.reduce((s, i) => s + i.quantity, 0),
    total_amount: items.reduce((s, i) => s + i.line_total, 0),
    has_issues: items.some((i) => !i.purchasable),
  };
};
const addItem = async (userId, { variant_id, quantity = 1 }) => {
  if (typeof variant_id !== "string" || !variant_id)
    throw new AppError(400, "Thiếu variant_id");
  readQuantity(quantity);

  return withTransaction(async (conn) => {
    const cartId = await cartModel.getOrCreateId(userId, conn);
    await cartModel.lock(cartId, conn);

    const variant = await productModel.findVariantForSale(variant_id, conn);
    if (!variant || !variant.sellable)
      throw new AppError(404, "Sản phẩm không tồn tại hoặc đã ngừng bán");

    const existing = await cartModel.findItemByVariant(
      cartId,
      variant_id,
      conn,
    );
    const inCart = existing?.quantity || 0;
    const wanted = inCart + quantity;

    if (wanted > MAX_PER_ITEM)
      throw new AppError(409, `Tối đa ${MAX_PER_ITEM} cho mỗi sản phẩm`);
    assertStock(variant.stock, wanted, inCart);

    if (existing) {
      await cartModel.setQuantity(existing.id, wanted, conn);
      return { id: existing.id, variant_id, quantity: wanted };
    }
    if ((await cartModel.countItems(cartId, conn)) >= MAX_ITEMS)
      throw new AppError(
        409,
        `Giỏ hàng tối đa ${MAX_ITEMS} sản phẩm khác nhau`,
      );

    const id = await cartModel.insertItem(cartId, variant_id, wanted, conn);
    return { id, variant_id, quantity: wanted };
  });
};

const updateItem = async (userId, itemId, quantity) => {
  readQuantity(quantity); 
  return withTransaction(async (conn) => {
    const item = await cartModel.findItemOwned(itemId, userId, conn);
    if (!item) throw new AppError(404, "Không tìm thấy sản phẩm trong giỏ");

    if (quantity > item.quantity) {
      const variant = await productModel.findVariantForSale(
        item.variant_id,
        conn,
      );
      if (!variant || !variant.sellable)
        throw new AppError(409, "Sản phẩm đã ngừng bán");
      assertStock(variant.stock, quantity);
    }

    await cartModel.setQuantity(itemId, quantity, conn);
    return { id: itemId, variant_id: item.variant_id, quantity };
  });
};

const removeItem = async (userId, itemId) => {
  if (!(await cartModel.deleteItemOwned(itemId, userId)))
    throw new AppError(404, "Không tìm thấy sản phẩm trong giỏ");
};

const clear = (userId) => cartModel.clearByUser(userId);

module.exports = { getCart, addItem, updateItem, removeItem, clear };
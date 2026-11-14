const AppError = require("../utils/AppError");
const productModel = require("../models/product.model");
const reviewModel = require("../models/review.model");

const MAX_COMMENT = 1000;

const maskName = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length <= 1) return parts[0] || "Khách hàng";

  const last = parts.pop();
  return `${parts.join(" ")} ${last[0]}.`;
};

const mustExist = async (productId) => {
  if (!(await productModel.exists(productId))) {
    throw new AppError(404, "Không tìm thấy sản phẩm");
  }
};

const toMine = (r) =>
  r
    ? {
        id: r.id,
        rating: r.rating,
        comment: r.comment || "",
        created_at: r.created_at,
      }
    : null;

const list = async (productId, query) => {
  await mustExist(productId);

  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 5, 1), 20);

  const [rows, dist] = await Promise.all([
    reviewModel.list(productId, limit, (page - 1) * limit),
    reviewModel.distribution(productId),
  ]);

  const distribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  let count = 0;
  let sum = 0;

  for (const { rating, n } of dist) {
    distribution[rating] = Number(n);
    count += Number(n);
    sum += rating * Number(n);
  }

  return {
    items: rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment || "",
      created_at: r.created_at,
      author: maskName(r.full_name),
    })),
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit),
    summary: {
      average: count ? Math.round((sum / count) * 10) / 10 : null,
      count,
      distribution,
    },
  };
};

const getMine = async (productId, userId) => {
  await mustExist(productId);

  return toMine(await reviewModel.findByUser(productId, userId));
};

const saveMine = async (productId, userId, body) => {
  const { rating, comment } = body;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new AppError(400, "rating phải là số nguyên từ 1 đến 5");
  }

  if (comment != null && typeof comment !== "string") {
    throw new AppError(400, "comment phải là chuỗi");
  }

  const text = (comment || "").trim();

  if (text.length > MAX_COMMENT) {
    throw new AppError(400, `Nhận xét tối đa ${MAX_COMMENT} ký tự`);
  }

  await mustExist(productId);

  const purchased = await reviewModel.hasPurchased(productId, userId);

  if (!purchased) {
    throw new AppError(
      403,
      "Bạn cần mua và hoàn thành đơn hàng chứa sản phẩm này mới được đánh giá",
    );
  }

  await reviewModel.upsert({
    userId,
    productId,
    rating,
    comment: text || null,
  });

  return toMine(await reviewModel.findByUser(productId, userId));
};

const removeMine = async (productId, userId) => {
  await mustExist(productId);

  const affectedRows = await reviewModel.removeByUser(productId, userId);

  if (!affectedRows) {
    throw new AppError(
      404,
      "Bạn chưa đánh giá sản phẩm này hoặc đánh giá không tồn tại",
    );
  }
};

module.exports = {
  list,
  getMine,
  saveMine,
  removeMine,
};

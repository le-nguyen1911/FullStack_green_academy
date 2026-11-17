const AppError = require("../utils/AppError");
const reviewModel = require("../models/review.model");

const STATUSES = ["APPROVED", "HIDDEN"];
const SORT_KEYS = ["newest", "oldest", "rating_desc", "rating_asc"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const readDate = (v, label) => {
  if (v === undefined || v === "") return undefined;
  if (!DATE_RE.test(v) || Number.isNaN(new Date(v).getTime()))
    throw new AppError(400, `${label} phải có dạng YYYY-MM-DD`);
  return v;
};

const readQuery = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 10, 1), 50);

  let rating;
  if (query.rating !== undefined && query.rating !== "") {
    rating = Number(query.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new AppError(400, "rating phải từ 1 đến 5");
  }
  let status;
  if (query.status !== undefined && query.status !== "") {
    if (!STATUSES.includes(query.status)) throw new AppError(400, `status phải là ${STATUSES.join(" hoặc ")}`);
    status = query.status;
  }
  const from = readDate(query.from, "from");
  const to = readDate(query.to, "to");
  if (from && to && from > to) throw new AppError(400, "from không được sau to");

  return {
    page, limit, offset: (page - 1) * limit,
    filters: { q: query.q?.trim().slice(0, 100) || undefined, rating, status, from, to },
    sort: SORT_KEYS.includes(query.sort) ? query.sort : "newest",
  };
};

const list = async (query) => {
  const p = readQuery(query);
  const { items, total } = await reviewModel.adminList(p.filters, p.sort, p.limit, p.offset);
  return { items, page: p.page, limit: p.limit, total, totalPages: Math.ceil(total / p.limit) };
};

const getOne = async (id) => {
  const review = await reviewModel.adminFindById(id);
  if (!review) throw new AppError(404, "Không tìm thấy đánh giá");
  return review;
};

const setStatus = async (id, status) => {
  if (!STATUSES.includes(status)) throw new AppError(400, `status phải là ${STATUSES.join(" hoặc ")}`);
  const review = await getOne(id);
  if (review.status !== status) await reviewModel.setStatus(id, status);   
  return getOne(id);
};

const remove = async (id) => {
  if (!(await reviewModel.adminRemove(id))) throw new AppError(404, "Không tìm thấy đánh giá");
};

module.exports = { list, getOne, setStatus, remove };

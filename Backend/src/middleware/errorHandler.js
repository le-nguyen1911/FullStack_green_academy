const AppError = require("../utils/AppError");

module.exports = (err, req, res, next) => {
  if (err instanceof AppError)
    return res.status(err.status).json({ message: err.message });

  console.error(err);
  if (err.code === "ER_DUP_ENTRY")
    return res.status(409).json({ message: "Dữ liệu đã tồn tại" });
  if (err.code === "ER_NO_REFERENCED_ROW_2")
    return res
      .status(400)
      .json({ message: "Dữ liệu tham chiếu không tồn tại" });
  if (err.code === "ER_ROW_IS_REFERENCED_2")
    return res
      .status(409)
      .json({ message: "Đang được sử dụng, không thể xóa" });
  res.status(500).json({ message: "Lỗi máy chủ" });
};

const AppError = require("../utils/AppError");
const { MAX_FILE_MB, MAX_FILES } = require("./upload.middleware");

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
  if (err.name === "MulterError") {
    const messages = {
      LIMIT_FILE_SIZE: `Mỗi ảnh tối đa ${MAX_FILE_MB}MB`,
      LIMIT_FILE_COUNT: `Tối đa ${MAX_FILES} ảnh mỗi lần`,
      LIMIT_UNEXPECTED_FILE: `Tối đa ${MAX_FILES} ảnh mỗi lần, tên trường phải là "images"`,
    };
    return res
      .status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400)
      .json({ message: messages[err.code] || "Tệp tải lên không hợp lệ" });
  }
};

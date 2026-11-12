const multer = require("multer");
const AppError = require("../utils/AppError");

const MAX_FILE_MB = 5;
const MAX_FILES = 10;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_MB * 1024 * 1024, files: MAX_FILES },
  fileFilter: (req, file, cb) =>
    ALLOWED.includes(file.mimetype)
      ? cb(null, true)
      : cb(new AppError(400, "Chỉ chấp nhận ảnh JPG, PNG, WEBP")),
});

exports.uploadImages = upload.array("images", MAX_FILES);
exports.MAX_FILE_MB = MAX_FILE_MB;
exports.MAX_FILES = MAX_FILES;

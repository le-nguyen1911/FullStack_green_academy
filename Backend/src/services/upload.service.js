const cloudinary = require("../config/cloudinary");
const AppError = require("../utils/AppError");
const imageModel = require("../models/image.model");

const FOLDERS = {
  products: "coffee_shop/products",
  brands: "coffee_shop/brands",
};

const uploadBuffer = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"], 
        transformation: [{ width: 1600, height: 1600, crop: "limit" }], 
      },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
    stream.end(buffer);
  });

const uploadImages = async (files, folderKey) => {
  const folder = FOLDERS[folderKey];
  if (!folder) throw new AppError(400, "folder không hợp lệ");
  if (!files?.length) throw new AppError(400, "Chưa chọn ảnh");

  const results = await Promise.allSettled(
    files.map((f) => uploadBuffer(f.buffer, folder)),
  );
  const ok = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);
  const failed = results.find((r) => r.status === "rejected");

  if (failed) {
    await Promise.allSettled(
      ok.map((r) => cloudinary.uploader.destroy(r.public_id)),
    );
    console.error("Cloudinary upload lỗi:", failed.reason?.message);
    throw failed.reason?.http_code === 400
      ? new AppError(400, "Tệp không phải ảnh hợp lệ")
      : new AppError(502, "Không tải được ảnh lên, vui lòng thử lại");
  }

  return ok.map((r) => ({
    url: r.secure_url,
    public_id: r.public_id,
    width: r.width,
    height: r.height,
  }));
};

const publicIdOf = (url) => {
  if (!url || !url.includes("res.cloudinary.com")) return null; 
  const m = /\/image\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i.exec(url);
  return m && m[1].startsWith("coffee_shop/") ? m[1] : null;
};

const destroyUnused = async (urls) => {
  for (const url of new Set(urls)) {
    const publicId = publicIdOf(url);
    if (!publicId) continue;
    try {
      if (await imageModel.isUsed(url)) continue; 
      await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true,
      });
    } catch (e) {
      console.error("Xóa ảnh Cloudinary lỗi:", e.message);
    }
  }
};

module.exports = { uploadImages, destroyUnused };

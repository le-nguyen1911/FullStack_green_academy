const service = require("../services/upload.service");

exports.images = async (req, res) =>
  res
    .status(201)
    .json({
      images: await service.uploadImages(
        req.files,
        req.query.folder || "products",
      ),
    });

const productService = require("../services/product.service");

exports.listPublic = async (req, res) =>
  res.json(await productService.listPublic(req.query));
exports.getPublic = async (req, res) =>
  res.json(await productService.getPublic(req.params.id));
exports.listBrands = async (req, res) => res.json(await brandService.list());

exports.listManager = async (req, res) =>
  res.json(await productService.listManager(req.query));
exports.getManager = async (req, res) =>
  res.json(await productService.getManager(req.params.id));

exports.create = async (req, res) =>
  res.status(201).json(await productService.create(req.body));

exports.update = async (req, res) => {
  await productService.update(req.params.id, req.body);
  res.json({ message: "Đã cập nhật sản phẩm" });
};

exports.remove = async (req, res) => {
  await productService.remove(req.params.id);
  res.json({ message: "Đã ẩn sản phẩm" });
};

exports.addVariant = async (req, res) =>
  res
    .status(201)
    .json(await productService.addVariant(req.params.id, req.body));

exports.updateVariant = async (req, res) => {
  await productService.updateVariant(req.params.variantId, req.body);
  res.json({ message: "Đã cập nhật biến thể" });
};

exports.removeVariant = async (req, res) => {
  await productService.removeVariant(req.params.variantId);
  res.json({ message: "Đã ẩn biến thể" });
};

exports.adjustStock = async (req, res) =>
  res.json(
    await productService.adjustStock(req.params.variantId, req.body.delta),
  );
exports.getPriceRange = async (req, res) =>
  res.json(await service.getPriceRange());
const productService = require("../services/product.service");
const brandModel = require("../models/brand.model");
const categoryModel = require("../models/category.model");
const productModel = require("../models/product.model");

exports.listPublic = async (req, res) =>
  res.json(await productService.listPublic(req.query));

exports.getPublic = async (req, res) =>
  res.json(await productService.getPublic(req.params.id));

exports.listBrands = async (req, res) => res.json(await brandModel.list());

exports.listcategories = async (req, res) =>
  res.json(await categoryModel.list());

exports.getPriceRange = async (req, res) =>
  res.json(await productService.getPriceRange());

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

exports.getRelated = async (req, res) =>
  res.json(await productService.getRelated(req.params.id));

exports.getAllProducts = async (req, res) => {
  try {
    const products = await productModel.getAll();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await productModel.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
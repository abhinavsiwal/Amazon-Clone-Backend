const Product = require("../models/product");
const APIFeatures = require("../utils/api-features");

// -----Create New Product-----
const newProduct = async (req, res, next) => {
  const {
    name,
    price,
    description,
    ratings,
    images,
    category,
    seller,
    stock,
    numOfReviews,
    reviews,
  } = req.body;

  user=req.user.id;

  try {
    const product = await Product.create({
      name,
      price,
      description,
      ratings,
      images,
      category,
      seller,
      stock,
      numOfReviews,
      reviews,
      user,
    });
    res.status(201).json({
      success: true,
      product,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Adding Product Failed" });
  }
};

// -----Get all Products-----
//------Search=>/api/products?keyword=apple
const getProducts = async (req, res, next) => {
  const queryStr = req.query;
  const resPerPage = 1; //How many products we wanna display in one page
  const productCount= await Product.countDocuments();
  const apiFeatures = new APIFeatures(Product.find(), queryStr)
    .search()
    .filter()
    .pagination(resPerPage);
  let products;

  try {
    products = await apiFeatures.query;
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Fetching Products Failed" });
  }

  res.status(200).json({
    success: true,
    count: products.length,
    productCount,
    products: products.map((product) => product.toObject()),
  });
};

// ----Get Product by product id
const getProductById = async (req, res, next) => {
  const productId = req.params.id;
  let product;
  try {
    product = await Product.findById(productId);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Fetching product failed" });
  }
  if (!product) {
    return res
      .status(500)
      .json({ message: "Could not find product for this id" });
  }
  res.json(product);
};

//-----Update Product
const updateProduct = async (req, res, next) => {
  const productId = req.params.id;
  let product;

  try {
    product = await Product.findById(productId);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Something Went Wrong in Update Product" });
  }
  if (!product) {
    return res
      .status(500)
      .json({ message: "Could not find product for this id" });
  }
  try {
    product = await Product.findByIdAndUpdate(productId, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Something Went Wrong in Update Product" });
  }
  res.status(200).json(product.toObject());
};

// -----Delete Product-----
const deleteProduct = async (req, res, next) => {
  const productId = req.params.id;
  let product;
  try {
    product = await Product.findById(productId);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Something went wrong in delete Product" });
  }
  if (!product) {
    return res
      .status(500)
      .json({ message: "Could not find product for this id" });
  }
  try {
    await product.remove();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Product could not be deleted" });
  }
  res.status(200).json({ message: "Product deleted Successfully" });
};

exports.newProduct = newProduct;
exports.getProducts = getProducts;
exports.getProductById = getProductById;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;

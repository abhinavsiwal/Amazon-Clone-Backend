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

  user = req.user.id;

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
  const resPerPage = 8; //How many products we wanna display in one page
  const productsCount = await Product.countDocuments();
  const apiFeatures = new APIFeatures(Product.find(), queryStr)
    .search()
    .filter()
    
    let products;
 


  try {
    
    products = await apiFeatures.query;
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Fetching Products Failed" });
  }
  let filteredProductsCount = products.length;
  apiFeatures.pagination(resPerPage);

  res.status(200).json({
    success: true,
    // count: products.length,
    resPerPage,
    productsCount,
    filteredProductsCount, 
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

// Create new Review
const createProductReview = async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  let product;
  try {
    product = await Product.findById(productId);
  } catch (err) {
    console.log(err);
    return res
      .status(404)
      .json({ message: "Something went wrong in Getting Product" });
  }
  const isReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }
  // Calculate Average Ratings
  product.ratings =product.reviews.reduce((acc,item)=>item.rating+acc,0)/reviews.length;

  try {
    await product.save({ validateBeforeSave: false });
  } catch (err) {
    console.log(err);
    return res
      .status(404)
      .json({ message: "Something went wrong in Saving Product" });
  }
  res.status(200).json({ success: true });
};

// Get Product Reviews
const getProductReviews = async (req, res) => {
  let product;
  try {
    product = await Product.findById(req.query.id);
  } catch (err) {
    console.log(err);
    return res
      .status(404)
      .json({ message: "Something went wrong in Getting Product Reviews" });
  }
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
};
// Delete Product Reviews
const deleteReview = async (req, res) => {
  let product;
  try {
    product = await Product.findById(req.query.productId);
  } catch (err) {
    console.log(err);
    return res
      .status(404)
      .json({ message: "Something went wrong in Getting Product Reviews" });
  }

  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== req.query.reviewId.toString()
  );
  const numOfReviews = reviews.length;

  const ratings =product.reviews.reduce((acc,item)=>item.rating+acc,0)/reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
};

exports.newProduct = newProduct;
exports.getProducts = getProducts;
exports.getProductById = getProductById;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.createProductReview = createProductReview;
exports.getProductReviews = getProductReviews;
exports.deleteReview = deleteReview;

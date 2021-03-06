const express = require("express");
const router = express.Router();

const {
  getProducts,
  getAdminProducts,
  newProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  deleteReview,
} = require("../controllers/product-controllers");
const {isAuthenticatedUser,authorizeRoles} = require('../middlewares/auth');

router.get("/products",getProducts);
router.get("/admin/products",getAdminProducts);
router.get("/product/:id", getProductById);
router.post("/admin/product/new",isAuthenticatedUser,authorizeRoles('admin'),newProduct);

router.put("/admin/product/:id",isAuthenticatedUser,authorizeRoles('admin'),updateProduct);
router.delete("/admin/product/:id",isAuthenticatedUser,authorizeRoles('admin'),deleteProduct);
router.put('/review',isAuthenticatedUser,createProductReview)
router.get('/reviews',isAuthenticatedUser,getProductReviews)
router.delete('/reviews',isAuthenticatedUser,deleteReview)

module.exports = router;

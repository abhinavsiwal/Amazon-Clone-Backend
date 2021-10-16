const express = require("express");
const router = express.Router();

const {
  getProducts,
  newProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/product-controllers");
const {isAuthenticatedUser,authorizeRoles} = require('../middlewares/auth');

router.get("/products",getProducts);
router.get("/product/:id", getProductById);
router.post("/product/new",isAuthenticatedUser,authorizeRoles('admin'),newProduct);

router.put("/admin/product/:id",isAuthenticatedUser,authorizeRoles('admin'),updateProduct);
router.delete("/admin/product/:id",isAuthenticatedUser,authorizeRoles('admin'),deleteProduct);

module.exports = router;

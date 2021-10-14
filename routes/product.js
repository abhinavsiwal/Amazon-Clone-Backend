const express = require('express');
const router = express.Router();

const {getProducts,newProduct,getProductById,updateProduct,deleteProduct} = require('../controllers/product-controllers');

router.get('/products',getProducts);
router.get('/product/:id',getProductById);
router.post('/product/new',newProduct);

router.put('/admin/product/:id',updateProduct);
router.delete('/admin/product/:id',deleteProduct);

module.exports = router;
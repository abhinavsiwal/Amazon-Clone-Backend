const express = require('express');
const router = express.Router();

const {getProducts} = require('../controllers/product-controllers');

router.get('/',getProducts);

module.exports = router;
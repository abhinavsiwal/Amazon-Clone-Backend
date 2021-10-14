const express = require('express');

const app = express();
app.use(express.json());

//Import all the routes
const products = require('./routes/product')

app.use('/api/products',products);

module.exports = app; 
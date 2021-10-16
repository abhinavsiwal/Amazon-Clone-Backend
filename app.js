const express = require('express');
const cookieParser = require('cookie-parser')

const app = express();
app.use(express.json());
app.use(cookieParser());

//Import all the routes
const products = require('./routes/product')
const auth = require('./routes/auth')

app.use('/api/',products);
app.use('/api/',auth)
module.exports = app; 
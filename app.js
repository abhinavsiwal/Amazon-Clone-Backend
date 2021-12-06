const express = require('express');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload')
const dotenv = require('dotenv');
dotenv.config({path:'./config/config.env'})

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}))
app.use(cookieParser());
app.use(fileUpload());


//Import all the routes
const products = require('./routes/product')
const auth = require('./routes/auth')
const order = require('./routes/order')
const payment = require('./routes/payment');

app.use('/api/',products);
app.use('/api/',auth);
app.use('/api/',order);
app.use('/api/',payment);

module.exports = app; 

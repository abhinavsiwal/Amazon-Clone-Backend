const Order = require("../models/order");
const Product = require("../models/product");

//Create a new Order
exports.newOrder = async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
  } = req.body;
  let order;
  try {
    order = await Order.create({
      orderItems,
      shippingInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentInfo,
      paidAt: Date.now(),
      user: req.user.id,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Order Failed" });
  }
  res.status(200).json({
    success: true,
    order,
  });
};

// Get single order
exports.getSingleOrder = async (req, res, next) => {
  let order;
  try {
    order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );
  } catch (err) {
    console.log(err);
  }
  if (!order) {
    return res.status(404).json({ message: "No order found with this id" });
  }
  res.status(200).json({
    success: true,
    order,
  });
};

// Get LoggedIn user orders
exports.myOrders = async (req, res, next) => {
    let orders;
    try {
      orders = await Order.find({user:req.user.id});
    } catch (err) {
      console.log(err);
    }
    if (!orders) {
      return res.status(404).json({ message: "No order found with this id" });
    }
    res.status(200).json({
      success: true,
      orders,
    });
  };
  
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
    order = await Order.findById(req.params.id).populate("user", "name email");
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
    orders = await Order.find({ user: req.user.id });
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

//   Get all orders =>Admin
exports.allOrders = async (req, res, next) => {
  let orders;
  try {
    orders = await Order.find();
  } catch (err) {
    console.log(err);
  }
  if (!orders) {
    return res.status(404).json({ message: "No order found with this id" });
  }
  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });
  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
};

//  Update /Process Order - Admin
exports.updateOrder = async (req, res, next) => {
  let order;
  try {
    order = await Order.findById(req.params.id);
  } catch (err) {
    console.log(err);
  }
  if (order.orderStatus === "Delivered") {
    return res
      .status(404)
      .json({ message: "You have already delivered the order" });
  }
  // order.orderItems.foreach(async (item) => {
  //   await updateStock(item.product, item.quantity);
  // });
  
  order.orderStatus = req.body.status,
  order.deliveredAt = Date.now();

  try {
    await order.save();
  } catch (err) {
    console.log(err);
    return res
    .status(404)
    .json({ message: "Something went wrong in saving order" });
  }

  res.status(200).json({
    success: true, 
  });
};
//Update Stock function
const updateStock = async (id, quantity) => {
  try {
    const product = await Product.findById(id);
    product.stock = product.stock - quantity;
    await product.save();
  } catch (err) {
    console.log(err);
  }
};

// Delete order =>Admin
exports.deleteOrder = async (req, res, next) => {
  let order;
  try {
    order = await Order.findById(req.params.id).populate("user", "name email");
  } catch (err) {
    console.log(err);
  }
  if (!order) {
    return res.status(404).json({ message: "No order found with this id" });
  }

  await order.remove();

  res.status(200).json({
    success: true,
  });
};

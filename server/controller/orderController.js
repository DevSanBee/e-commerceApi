const catchAsyncErrors = require(`../middleWares/catchAsyncErrors`);
const ErrorHandler = require(`../utils/ErrorHandler`);
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

// Create a new order ==> endpoint: /api/orders/new
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    paymentInfo,
    taxPrice,
    itemsPrice,
    orderItems,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    paymentInfo,
    taxPrice,
    itemsPrice,
    orderItems,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

// Get a single order ==> endpoint: /api/orders/:orderId
exports.getAnOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId).populate(
    "user",
    "name email"
  );
  if (!order) {
    return next(new ErrorHandler("Can not find this order", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// Get my available order ==> endpoint: /api/orders/me
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const myOrders = await Order.find({ user: req.user._id });
  if (!myOrders) {
    return next(new ErrorHandler("Can not find this order", 404));
  }

  res.status(200).json({
    success: true,
    message: `${
      myOrders.length
        ? "Showing your available order items"
        : "You don't have any available item"
    }`,
    count: myOrders.length,
    myOrders,
  });
});

// Get all available order with the total price ==> endpoint: /api/admin/orders
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();
  let total = 0;
  orders.forEach((order) => (total += order.totalPrice));

  res.status(200).json({
    success: true,
    totalAmount: total,
    orders,
  });
});

// Updating the order status wtih the amount of the product in store
// Endpoint ==> api/orders/
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);

  if (order.orderStatus === "delivered") {
    return next(new ErrorHandler("You have already delivered this order", 400));
  }
  order.orderItems.forEach(async (item) => {
    const product = await Product.findById(item.product);
    product.stock = product.stock - item.quantity;

    await product.save();
  });
  order.orderStatus = req.body.orderStatus;
  order.deliveredAt = Date.now();

  order.save();
  res.status(200).json({
    success: true,
    order,
  });
});

// Deleting an order by an Admin user ==> endpoint: api/admin/orders/:orderId
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId)
  if (!order) {
    return next(new ErrorHandler('No such order found', 404)); 
  }

  await order.remove()
  res.status(200).json({
    success: true,
  })
})

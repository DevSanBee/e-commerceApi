const express = require("express");
const {
  createOrder,
  getAnOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
} = require("../controller/orderController");
const {
  isAuthenticatedUser,
  verifyRole,
} = require("../middleWares/authMiddleWare");

const orderRouter = express.Router();

orderRouter.route("/orders/me").get(isAuthenticatedUser, myOrders);
orderRouter.route("/orders/new").post(isAuthenticatedUser, createOrder);
orderRouter.route("/orders/:orderId").get(isAuthenticatedUser, getAnOrder);
orderRouter
  .route("/admin/orders")
  .get(isAuthenticatedUser, verifyRole("admin"), getAllOrders);
orderRouter
  .route("/admin/orders/:orderId")
  .delete(isAuthenticatedUser, verifyRole("admin"), deleteOrder)
  .put(isAuthenticatedUser, verifyRole("admin"), updateOrder);

module.exports = orderRouter;

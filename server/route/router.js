const express = require("express");
const {
  getProducts,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  updateAllProducts,
  createReview,
} = require("../controller/productController");
const {
  isAuthenticatedUser,
  verifyRole,
} = require("../middleWares/authMiddleWare");
const router = express.Router();

router
  .route("/products")
  .get(getProducts)
router.route("/products/:id").get(getSingleProduct);
router
  .route("/admin/products")
  .post(isAuthenticatedUser, verifyRole("admin"), createProduct);
router
  .route("/admin/products/:id")
  .put(isAuthenticatedUser, verifyRole("admin"), updateProduct)
  .delete(isAuthenticatedUser, verifyRole("admin"), deleteProduct);
router
  .route("/products/review")
  .post(isAuthenticatedUser, createReview)

module.exports = router;

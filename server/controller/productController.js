const Product = require("../models/productModel");
const APIFeatures = require("../utils/APIFeature");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleWares/catchAsyncErrors");


// Get all the available products ==> endpoint: api/products
exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  const resultsPerPage = 5;
  const productsCount = Product.countDocuments();
  const apiFeatures = new APIFeatures(Product.find(), req.query)
    .Search()
    .filter()
    .pagitnation(resultsPerPage);
  const products = await apiFeatures.query;
  if (!products) {
    return next(new ErrorHandler("Something went wrong", 404));
  }
  res.status(200).json({
    success: true,
    productsCount,
    message: `Fetched all available products successfully`,
    products,
  });
});

// Create a new product ==> endpoint: api/admin/product
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user.id;

  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    message: `The product has been created successfully`,
    product,
  });
});

// Get a single product ==> endpoint: api/products/:id
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  res.status(200).json({
    success: true,
    product,
  });
});
// Update a product ==> endpoint: api/admin/products/:id
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  res.status(200).json({
    success: true,
    product,
  });
});

// Delete a product ==> endpoint: api/products/:id
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  await product.remove();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

exports.updateAllProducts = catchAsyncErrors(async (req, res, next) => {
  // const { amountInStore } = req.body;
  // const products = await Product.find();
  // products.forEach((product) => {
  //   product.amountInStore = amountInStore;
  // });
  // products.user = req.user.id
  // // await products.save();
  // res.status(200).json({
  //   success: true,
  // });
});

// Create / update a review of a product ==> endpoint: api/products/review
exports.createReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const reviews = {
    user: req.user.id,
    name: req.user.name,
    comment,
    rating: Number(rating),
  };
  const product = await Product.findById(productId);
  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user.id.toString()
  );
  console.log(isReviewed);
  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user.id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(reviews);
    product.numberOfReviews = product.reviews.length;
  }
  product.ratings =
    product.reviews.reduce((acc, item) => (item.rating += acc), 0) /
    product.reviews.length;
  await product.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

const ErrorHandler = require("../utils/ErrorHandler");

// Efror middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // FOr DEVELOPMENT MODE
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      ErrorMessage: err.message,
      stack: err.stack,
    });
  }

  // FOr PRODUCTION MODE
  if (process.env.NODE_ENV === "PRODUCTION") {

    let error = {...err}

    error.message = err.message
    // Mongodn ObjectID Failure
    if (err.name === 'CastError') {
      const message = `Resource not found, Invalid ${err.path}`
      error = new ErrorHandler(message, 400)
    }
    if (err.name === "ValidatiorError") {
      const message = Object.values(err.error).map(value => value.message)
      error = new ErrorHandler(message, 400)
    }
    if (err.code === 11000){
      const message = `Duplicate ${Object.values(error.keyValue)} error`
      error = new ErrorHandler(message,400)
    }
    if (err.name === "JsonWebTokenError"){
      const message = `Invalid JsonWebToken`
      error = new ErrorHandler(message,400)
    }
    if (err.name === "TokenExpiredError"){
      const message = `Expired JsonWebToken`
      error = new ErrorHandler(message,400)
    }
    
      res.status(error.statusCode).json({
        success: false,
        message: error.message || "Internal server error",
      });
  }
};

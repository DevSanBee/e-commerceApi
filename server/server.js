const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const router = require("./route/router");
const connectDB = require("./config/connectDB");
const ErrorMiddleWare = require("./middleWares/ErrorMiddleWare");
const authRouter = require("./route/authRouter");
const orderRouter = require("./route/orderRoute");
const cookieParser = require("cookie-parser");


connectDB()
// Error handler for unhandled Exceptions
process.on("uncaughtException", (err)=>{
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to uncaught exception`);
  process.exit(1)
})

const port = process.env.PORT;
const app = express();
app.use(express.json());
app.use(cookieParser())
app.use(cors());


app.use("/api", router);
app.use("/api", authRouter )
app.use("/api", orderRouter);


app.use(ErrorMiddleWare)

const server = app.listen(port, () =>
  console.log(`Server running on port ${port} in ${process.env.NODE_ENV} mode`)
);

//Error handler for unhandled Rejections
process.on('unhandledRejection', err=>{
  console.log(err.message)
  console.log(`Shutting down the server due to unhandled promise rejection`)
  server.close(()=>{
    process.exit(1)
  })
})
const connectDB = require("./config/connectDB")
const Product = require("./models/productModel")
const productData = require('../server/productData.json')

require("dotenv").config()
connectDB()

const seeder = async (req,res) =>{
    try {
        await Product.deleteMany()
        console.log("Deleted all the available products from the database")
        await Product.insertMany(productData)
        console.log("Posted all the available products to database")

        process.exit()
    } catch (error) {
        console.log(error)
    }
}
seeder()
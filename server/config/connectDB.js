const { default: mongoose } = require("mongoose")

mongoose.set("strictQuery", false);
const connectDB = ()=>{
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser:true,
        useUnifiedTopology:true
    }).then(e=>{
        console.log(`Connected to the DB successfully`)
    }).catch(e=>{
        throw new Error(`Error connecting to the DB: ${e.message}`);
    })
}

module.exports = connectDB
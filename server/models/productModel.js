const mongoose  = require("mongoose");

const productSchema = mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please enter a name'],
        trim: true,
        maxLength: [100, 'Name must not pass 100 characters']
    },
    price:{
        type: Number,
        required: [true, 'Please enter the price']
    },
    description:{
        type: String,
        required: [true, 'Please add some descriptions'],
        minLength:[100, 'Description must not be less than 100 characters']
    },
    ratings:{
        type: Number,
        default: 0,
        required: true
    },
    category:{
        type: Object,
        required: [true, 'Please specify the category'],
        enum:{
            vaule:[
                'Electronics',
                'Cameras',
                'Laptops',
                'Accessories',
                'Headphones',
                'Food',
                'Books',
                'Clothes/Shoes',
                'Beauty/Health',
                'Sports',
                'Outdoor',
                'Home Appliances'
            ],
            message: 'Please select a category'
        }
    },
    image:[
        {
            public_id:{
                type: String,
                required: true
            },
            url:{
                type: String,
                required:true
            }
        }
    ],
    seller:{
        type: String,
        required: [true, 'Please enter the product seller'],
    },
    stock:{
        type: Number,
        required: [true, 'Please enter the amount in store'],
        maxLength: [5, 'The amount lenght can not exceed 5'],
        default:0
    },
    numberOfReviews:{
        type: Number,
        required: [true, 'Please enter the total number of reviews'],
        default: 0
    },
    reviews:[
        {
            user:{
                type: String,
                // unique: true,
                required: true
            },
            comment:{
                type: String,
                required: true
            },
            rating:{
                type: Number,
                required: true
            }
        }
    ],
    user:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        // required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product
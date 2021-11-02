const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100,
  },
  price: {
    type: Number,
    required: true,
    maxLength: 5,
    default: 0,
  },
  description: {
    type: String,
    required: true,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: true,
    enum: {
      values: [
        "Electronics",
        "Cameras",
        "Laptops",
        "Mobiles",
        "Accessories",
        "Headphones",
        "Food",
        "Books",
        "Clothes",
        "Shoes",
        "Beauty",
        "Health",
        "Sports",
        "Outdoor",
        "Home",
      ],
      message:"Please select correct category for product"
    },
  },
  seller:{
      type:String,
      required:true,
  },
  stock:{
      type:Number,
      required:true,
      maxLength:5,
      default:0,
  },
  numOfReviews:{
      type:Number,
      default:0,
  },
  reviews:[{
      name:{
        type: String,
        required: true,
      },
      rating:{
          type:Number,
          required:true,
      },
      comment:{
          type:String,
          required:true,
      }
  }],
  user:{
    type:mongoose.Types.ObjectId,
    ref:'User',
    required:true,
  },
  createdAt:{
      type:Date,
      default:Date.now
  }
});

module.exports = mongoose.model("Product", productSchema);

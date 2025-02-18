import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a product name"],
    unique: [true, "Product name already exists"],
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
    maxlength: [100, "Product description can not be more than 100 characters"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Please add a price"],
    trim: true,
    min: [0, "Price must be a positive number"],
  },
  discount: {
    type: Number,
    required: false,
    default: 0,
    trim: true,
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
});

const Product = mongoose.model("Product", ProductSchema);
export default Product;

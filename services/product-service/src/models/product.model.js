const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        enum: ["USD", "INR"],
        default: "INR",
      },
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    images: [
      {
        url: String,
        thumbnail: String,
        id: String,
      },
    ],
    catagory: {
      type: String,
      enum: ["Electronics", "Books", "Fashion"],
      required: true,
      trim: true,
    },
    stock: {
      quantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
      },
    },
  },
  { timestamps: true },
);
productSchema.index({
  title: "text",
  description: "text",
  catagory: "text",
});

const productModel = mongoose.model("product", productSchema);

module.exports = productModel;

const mongoose = require("mongoose");
const productModel = require("../models/product.model");
const { uploadImage, deleteImage } = require("../services/imagekit.service");
const { getStockStatus } = require("../utils/stock.utils");

const createProductController = async (req, res) => {
  try {
    const {
      title,
      description,
      priceAmount,
      priceCurrency = "INR",
      catagory,
      stockQuantity,
    } = req.body;

    const price = {
      amount: Number(priceAmount),
      currency: priceCurrency,
    };

    const seller = req.user.id;

    if (!seller) {
      return res.status(400).json({
        message: "Seller not found",
      });
    }

    const images = await Promise.all(
      (req.files || []).map((file) => uploadImage({ buffer: file.buffer })),
    );

    const product = await productModel.create({
      title,
      description,
      price,
      seller,
      images,
      catagory,
      stock: {
        quantity: Number(stockQuantity) || 0,
      },
    });

    return res.status(201).json({
      message: "Product created",
      product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProductsController = async (req, res) => {
  try {
    const {
      q,
      catagory,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sort,
    } = req.query;

    const filter = {};
    if (q) {
      filter.$text = { $search: q };
    }

    if (catagory) {
      filter.catagory = catagory;
    }

    if (minPrice || maxPrice) {
      filter["price.amount"] = {};
      if (minPrice) {
        filter["price.amount"].$gte = Number(minPrice);
      }
      if (maxPrice) {
        filter["price.amount"].$lte = Number(maxPrice);
      }
    }

    let sortOption = {};
    switch (sort) {
      case "price_asc":
        sortOption = { "price.amount": 1 };
        break;
      case "price_desc":
        sortOption = { "price.amount": -1 };
        break;
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const products = await productModel
      .find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(Math.min(Number(limit), 10));

    const totalProducts = await productModel.countDocuments(filter);

    return res.status(200).json({
      message: "Products retrieved",
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProductByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }
    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    return res.status(200).json({
      message: "Product retrieved",
      product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }
    const product = await productModel.findOne({
      _id: id,
    });

    if (!product._id) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden: You are not the seller of this product",
      });
    }
    const allowedFields = [
      "title",
      "description",
      "priceAmount",
      "priceCurrency",
      "catagory",
    ];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === "priceAmount" || field === "priceCurrency") {
          if (!product.price) {
            product.price = {};
          }
          if (field === "priceAmount") {
            product.price.amount = Number(req.body.priceAmount);
          } else {
            product.price.currency = req.body.priceCurrency;
          }
        } else {
          product[field] = req.body[field];
        }
      }
    }

    await product.save();

    return res.status(200).json({
      message: "Product updated",
      product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getSellerProductsController = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const { skip = 0, limit = 10 } = req.query;

    const products = await productModel
      .find({ seller: sellerId })
      .skip(Number(skip))
      .limit(Math.min(Number(limit), 10));

    const formattedProducts = products.map((product) => {
      return {
        ...product.toObject(),

        stockStatus: getStockStatus(product.stock.quantity),
      };
    });
    return res.status(200).json({
      message: "Seller products retrieved",
      products: formattedProducts,
      totalProducts: formattedProducts.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product = await productModel.findOne({
      _id: id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden: You are not the seller of this product",
      });
    }
    if (product.images?.length > 0) {
      await Promise.all(product.images.map((image) => deleteImage(image.id)));
    }

    await product.deleteOne();

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createProductController,
  getProductsController,
  getProductByIdController,
  updateProductController,
  getSellerProductsController,
  deleteProductController,
};

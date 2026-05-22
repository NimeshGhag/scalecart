const productModel = require("../models/product.model");
const { uploadImage } = require("../services/imagekit.service");

const createProductController = async (req, res) => {
  try {
    const {
      title,
      description,
      priceAmount,
      priceCurrency = "INR",
      catagory,
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

module.exports = {
  createProductController,
  getProductsController,
};

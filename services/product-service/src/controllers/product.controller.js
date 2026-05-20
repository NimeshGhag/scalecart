const productModel = require("../models/product.model");

const createProductController = async (req, res) => {
  try {
    const {
      title,
      description,
      priceAmount,
      priceCurrency = "INR",
      images,
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
    const product = await productModel.create({
      title,
      description,
      price,
      seller,
      images,
    });

    return res.status(201).json({
      message: "Product created",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
module.exports = { createProductController };

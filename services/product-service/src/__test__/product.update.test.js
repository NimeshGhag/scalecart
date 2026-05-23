const request = require("supertest");
const mongoose = require("mongoose");

// Mock image upload service to avoid importing ESM-only dependencies
jest.mock("../services/imagekit.service.js", () => ({
  uploadImage: jest.fn().mockResolvedValue({
    url: "https://example.com/product.jpg",
    thumbnail: "https://example.com/product-thumb.jpg",
    id: "img_123",
  }),
}));

// Mock only `updateProductValidation` to be a passthrough while keeping the actual create validation
jest.mock("../middlewares/validator.middleware", () => {
  const actual = jest.requireActual("../middlewares/validator.middleware");
  return {
    ...actual,
    updateProductValidation: (req, res, next) => next(),
  };
});

// Mock auth middleware to simulate an authenticated seller
jest.mock("../middlewares/auth.middleware", () => {
  return (roles = ["user"]) => {
    return (req, res, next) => {
      req.user = {
        id: "6650f0c1e8f1a2b3c4d5e6f7",
        role: "seller",
      };
      next();
    };
  };
});

const app = require("../app");
const productModel = require("../models/product.model");

describe("PATCH /api/products/update-product/:id", () => {
  it("updates product when seller matches and returns 200", async () => {
    const sellerId = new mongoose.Types.ObjectId("6650f0c1e8f1a2b3c4d5e6f7");

    const product = await productModel.create({
      title: "Old Title",
      description: "Old desc",
      price: { amount: 100, currency: "INR" },
      seller: sellerId,
      catagory: "Electronics",
    });

    const res = await request(app)
      .patch(`/api/products/update-product/${product._id}`)
      .send({
        title: "New Title",
        priceAmount: "150",
        priceCurrency: "USD",
      });

    expect(res.status).toBe(200);
    expect(res.body.product).toBeDefined();
    expect(res.body.product.title).toBe("New Title");
    expect(res.body.product.price.amount).toBe(150);
    expect(res.body.product.price.currency).toBe("USD");
  });

  it("returns 403 when seller does not match", async () => {
    const otherSellerId = new mongoose.Types.ObjectId();
    const product = await productModel.create({
      title: "Product",
      description: "Desc",
      price: { amount: 100, currency: "INR" },
      seller: otherSellerId,
      catagory: "Electronics",
    });

    const res = await request(app)
      .patch(`/api/products/update-product/${product._id}`)
      .send({ title: "Attempted Update" });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Forbidden/);
  });

  it("returns 400 for invalid product id", async () => {
    const res = await request(app)
      .patch(`/api/products/update-product/invalid-id`)
      .send({ title: "x" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid product ID/);
  });
});

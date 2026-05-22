const request = require("supertest");
const mongoose = require("mongoose");

jest.mock("../services/imagekit.service.js", () => ({
  uploadImage: jest.fn().mockResolvedValue({
    url: "https://example.com/product.jpg",
    thumbnail: "https://example.com/product-thumb.jpg",
    id: "img_123",
  }),
}));

const app = require("../app");
const productModel = require("../models/product.model");

describe("GET /api/products/", () => {
  it("retrieves products with default pagination", async () => {
    const sellerId = new mongoose.Types.ObjectId();

    await productModel.create({
      title: "Product One",
      description: "First product",
      price: { amount: 100, currency: "INR" },
      seller: sellerId,
      catagory: "Electronics",
    });

    await productModel.create({
      title: "Product Two",
      description: "Second product",
      price: { amount: 200, currency: "INR" },
      seller: sellerId,
      catagory: "Electronics",
    });

    const res = await request(app).get("/api/products");

    expect(res.status).toBe(200);
    expect(res.body.products).toBeDefined();
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBe(2);
    expect(res.body.totalProducts).toBe(2);
    expect(res.body.currentPage).toBe(1);
  });
});

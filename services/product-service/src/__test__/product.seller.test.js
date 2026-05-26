const request = require("supertest");
const mongoose = require("mongoose");

// Use a fixed mock seller id so created products and the mocked middleware match
const MOCK_SELLER_ID = new mongoose.Types.ObjectId().toString();

jest.mock("../middlewares/auth.middleware", () => {
  return (roles = ["user"]) => {
    return (req, res, next) => {
      req.user = {
        id: MOCK_SELLER_ID,
        role: "seller",
      };
      next();
    };
  };
});

// Mock ImageKit upload service to avoid importing ESM `uuid` in tests
jest.mock("../services/imagekit.service.js", () => ({
  uploadImage: jest.fn().mockResolvedValue({
    url: "https://example.com/product.jpg",
    thumbnail: "https://example.com/product-thumb.jpg",
    id: "img_123",
  }),
}));

const app = require("../app");
const productModel = require("../models/product.model");

describe("GET /api/products/seller", () => {
  it("retrieves only products for the authenticated seller with stockStatus", async () => {
    const otherSellerId = new mongoose.Types.ObjectId().toString();

    await productModel.create({
      title: "Seller Product 1",
      description: "First seller product",
      price: { amount: 100, currency: "INR" },
      seller: MOCK_SELLER_ID,
      catagory: "Electronics",
      stock: { quantity: 0 },
    });

    await productModel.create({
      title: "Seller Product 2",
      description: "Second seller product",
      price: { amount: 200, currency: "INR" },
      seller: MOCK_SELLER_ID,
      catagory: "Electronics",
      stock: { quantity: 3 },
    });

    // product for another seller - should not be returned
    await productModel.create({
      title: "Other Seller Product",
      description: "Another seller",
      price: { amount: 300, currency: "INR" },
      seller: otherSellerId,
      catagory: "Electronics",
      stock: { quantity: 10 },
    });

    const res = await request(app).get("/api/products/seller");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.totalProducts).toBe(2);

    const statuses = res.body.products.map((p) => p.stockStatus);
    expect(statuses).toContain("Out of Stock");
    expect(statuses).toContain("Low Stock");
  });
});

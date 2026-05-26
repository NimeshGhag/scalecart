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

// Mock ImageKit delete service so no external call is made
jest.mock("../services/imagekit.service.js", () => ({
  deleteImage: jest.fn().mockResolvedValue(true),
}));

const app = require("../app");
const productModel = require("../models/product.model");

describe("DELETE /api/products/:id", () => {
  it("deletes a product when seller matches and returns 200", async () => {
    const product = await productModel.create({
      title: "Delete Me",
      description: "To be deleted",
      price: { amount: 50, currency: "INR" },
      seller: MOCK_SELLER_ID,
      catagory: "Electronics",
      images: [{ url: "https://example.com/1.jpg", id: "img_1" }],
    });

    const res = await request(app).delete(`/api/products/${product._id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Product deleted successfully/);

    const found = await productModel.findById(product._id);
    expect(found).toBeNull();
  });

  it("returns 403 when seller does not match", async () => {
    const otherSellerId = new mongoose.Types.ObjectId();
    const product = await productModel.create({
      title: "Not Yours",
      description: "Other seller",
      price: { amount: 60, currency: "INR" },
      seller: otherSellerId,
      catagory: "Electronics",
    });

    const res = await request(app).delete(`/api/products/${product._id}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Forbidden/);
  });

  it("returns 400 for invalid product id", async () => {
    const res = await request(app).delete(`/api/products/invalid-id`);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid product ID/);
  });

  it("returns 404 for non-existing id", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/products/${fakeId}`);
    expect(res.status).toBe(404);
  });
});

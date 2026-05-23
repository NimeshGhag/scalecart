const request = require("supertest");
const mongoose = require("mongoose");

const app = require("../app");
const productModel = require("../models/product.model");

jest.mock("../services/imagekit.service.js", () => ({
  uploadImage: jest.fn().mockResolvedValue({
    url: "https://example.com/product.jpg",
    thumbnail: "https://example.com/product-thumb.jpg",
    id: "img_123",
  }),
}));

describe("GET /api/products/:id", () => {
  it("retrieves a product by id", async () => {
    const sellerId = new mongoose.Types.ObjectId();

    const product = await productModel.create({
      title: "Single Product",
      description: "A product",
      price: { amount: 150, currency: "INR" },
      seller: sellerId,
      catagory: "Books",
    });

    const res = await request(app).get(`/api/products/${product._id}`);

    expect(res.status).toBe(200);
    expect(res.body.product).toBeDefined();
    expect(res.body.product._id).toBe(product._id.toString());
    expect(res.body.product.title).toBe("Single Product");
  });

  it("returns 404 for non-existing id", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/products/${fakeId}`);
    expect(res.status).toBe(404);
  });
});

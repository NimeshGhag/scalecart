const request = require("supertest");
const app = require("../app");

// Mock ImageKit upload service so no real API call is made
jest.mock("../services/imagekit.service.js", () => ({
  uploadImage: jest.fn().mockResolvedValue({
    url: "https://example.com/product.jpg",
    thumbnail: "https://example.com/product-thumb.jpg",
    id: "img_123",
  }),
}));

// Mock auth middleware so every request is treated as authenticated seller
// Mock auth middleware so every request is treated as authenticated seller
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

describe("POST /api/products/create-product", () => {
  it("creates a product and returns 201", async () => {
    const res = await request(app)
      .post("/api/products/create-product")
      .field("title", "iPhone 15")
      .field("description", "Latest Apple smartphone")
      .field("priceAmount", "79999")
      .field("priceCurrency", "INR")
      .field("catagory", "Electronics")
      .field("stockQuantity", "10");

    expect(res.status).toBe(201);
    expect(res.body.product).toBeDefined();
    expect(res.body.product.title).toBe("iPhone 15");
    expect(res.body.product.description).toBe("Latest Apple smartphone");
    expect(res.body.product.price.amount).toBe(79999);
    expect(res.body.product.price.currency).toBe("INR");
    expect(res.body.product.seller).toBe(
      "6650f0c1e8f1a2b3c4d5e6f7"
    );
    expect(res.body.product.catagory).toBe("Electronics");
    expect(res.body.product.stock.quantity).toBe(10);
  });

  it("validates missing fields with 400", async () => {
    const res = await request(app)
      .post("/api/products/create-product")
      .field("title", "")
      .field("description", "")
      .field("priceAmount", "")
      .field("catagory", "")
      .field("stockQuantity", "");

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it("validates invalid price with 400", async () => {
    const res = await request(app)
      .post("/api/products/create-product")
      .field("title", "Test Product")
      .field("description", "Test Description")
      .field("priceAmount", "-100")
      .field("catagory", "Electronics")
      .field("stockQuantity", "10");

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it("uses INR as default currency when not provided", async () => {
    const res = await request(app)
      .post("/api/products/create-product")
      .field("title", "MacBook Pro")
      .field("description", "Apple laptop")
      .field("priceAmount", "199999")
      .field("catagory", "Electronics");

    expect(res.status).toBe(201);
    expect(res.body.product.price.currency).toBe("INR");
  });
});
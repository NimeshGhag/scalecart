const request = require("supertest");
const app = require("../src/app");
const userModel = require("../src/models/user.model");

describe("GET /api/auth/me", () => {
  let cookies;

  beforeAll(async () => {
    // Register test user
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "john_doe",
        email: "john_doe@example.com",
        password: "password123",
      })
      .expect(201);

    // Mark user as verified so login is allowed
    await userModel.updateOne(
      { email: "john_doe@example.com" },
      { isVerified: true }
    );

    // Login and capture authentication cookie
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "john_doe@example.com",
        password: "password123",
      })
      .expect(200);

    cookies = loginResponse.headers["set-cookie"];
  });

  it("should return the authenticated user", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Cookie", cookies)
      .expect(200);

    expect(response.body.message).toBe(
      "Current user fetched successfully"
    );

    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe(
      "john_doe@example.com"
    );
    expect(response.body.user.role).toBe("user");
  });

  it("should return 401 when no token is provided", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .expect(401);

    expect(response.body.message).toBe(
      "Unauthorized: No token provided"
    );
  });

  it("should return 401 when token is invalid", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Cookie", ["accessToken=invalid-token"])
      .expect(401);

    expect(response.body.message).toBe(
      "Unauthorized: Invalid token"
    );
  });
});
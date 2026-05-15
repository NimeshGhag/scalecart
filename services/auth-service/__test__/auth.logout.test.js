const request = require("supertest");
const app = require("../src/app");
const userModel = require("../src/models/user.model");

// Mock refresh token model because logout deletes the refresh token from DB
jest.mock("../src/models/refreshToken.model", () => ({
  findOneAndUpdate: jest.fn().mockResolvedValue({}), // used during login
  findOneAndDelete: jest.fn().mockResolvedValue({}), // used during logout
}));

// Mock Redis because logout blacklists both access and refresh tokens
jest.mock("../src/db/redis", () => ({
  set: jest.fn().mockResolvedValue("OK"),
}));

describe("POST /api/auth/logout", () => {
  let cookies;

  beforeAll(async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "logout_user",
        email: "logout_user@example.com",
        password: "password123",
      })
      .expect(201);

    await userModel.updateOne(
      { email: "logout_user@example.com" },
      { isVerified: true },
    );

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "logout_user@example.com", password: "password123" })
      .expect(200);

    cookies = loginRes.headers["set-cookie"];
  });

  it("clears authentication cookie and returns 200", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", cookies)
      .expect(200);

    expect(res.body.message).toBeDefined();

    const setCookie = res.headers["set-cookie"];
    expect(setCookie).toBeDefined();
    expect(setCookie.join(";")).toMatch(/accessToken=;/);
    expect(setCookie.join(";")).toMatch(/refreshToken=;/);
  });

  it("returns 200 even when not authenticated", async () => {
    const res = await request(app).post("/api/auth/logout").expect(200);

    expect(res.body.message).toBeDefined();
    const setCookie = res.headers["set-cookie"];
    expect(setCookie).toBeDefined();

    const cookieString = setCookie.join(";");

    // Controller still clears cookies even if they don't exist
    expect(cookieString).toMatch(/accessToken=;/);
    expect(cookieString).toMatch(/refreshToken=;/);
  });
});

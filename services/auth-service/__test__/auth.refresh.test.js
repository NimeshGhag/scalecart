const request = require("supertest");
const app = require("../src/app");
const bcrypt = require("bcryptjs");
const userModel = require("../src/models/user.model");

describe("POST /api/auth/refresh-token", () => {
  it("refreshes tokens when valid refresh token cookie present", async () => {
    const payload = {
      name: "refresh_user",
      email: "refresh@example.com",
      password: "Refresh123!",
    };

    const hash = await bcrypt.hash(payload.password, 10);
    await userModel.create({
      name: payload.name,
      email: payload.email,
      password: hash,
      isVerified: true,
    });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: payload.password });

    expect(loginRes.status).toBe(200);
    const setCookie = loginRes.headers["set-cookie"];
    expect(setCookie).toBeDefined();

    const res = await request(app)
      .post("/api/auth/refresh-token")
      .set("Cookie", setCookie.join(";"))
      .send();

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();

    const newSetCookie = res.headers["set-cookie"];
    expect(newSetCookie).toBeDefined();
    expect(newSetCookie.join(";")).toMatch(/accessToken=/);
    expect(newSetCookie.join(";")).toMatch(/refreshToken=/);
  });

  it("returns 401 when no refresh token cookie", async () => {
    const res = await request(app).post("/api/auth/refresh-token").send();

    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  it("returns 401 for invalid refresh token", async () => {
    const payload = {
      name: "invalid_user",
      email: "invalid@example.com",
      password: "Invalid123!",
    };

    const hash = await bcrypt.hash(payload.password, 10);
    await userModel.create({
      name: payload.name,
      email: payload.email,
      password: hash,
      isVerified: true,
    });

    const res = await request(app)
      .post("/api/auth/refresh-token")
      .set("Cookie", "refreshToken=invalidtoken")
      .send();

    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });
});

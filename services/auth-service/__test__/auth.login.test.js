const request = require("supertest");
const app = require("../src/app");
const bcrypt = require("bcryptjs");
const userModel = require("../src/models/user.model");

describe("POST /api/auth/login", () => {
  it("logs in with correct credentials and returns 200 with user and sets cookie", async () => {
    const payload = {
      name: "jane_doe",
      email: "jane@example.com",
      password: "Secret123!",
    };
    const hash = await bcrypt.hash(payload.password, 10);
    await userModel.create({
      name: payload.name,
      email: payload.email,
      password: hash,
      isVerified: true,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: payload.password });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(payload.email);
    expect(res.body.user.name).toBe(payload.name);
    expect(res.body.user.password).toBeUndefined();

    const setCookie = res.headers["set-cookie"];
    expect(setCookie).toBeDefined();
    expect(setCookie.join(";")).toMatch(/accessToken=/);
    expect(setCookie.join(";")).toMatch(/refreshToken=/);
  });

  it("rejects wrong password with 401", async () => {
    const payload = {
      name: "jack_smith",
      email: "jack@example.com",
      password: "Secret123!",
    };
    const hash = await bcrypt.hash(payload.password, 10);
    await userModel.create({
      name: payload.name,
      email: payload.email,
      password: hash,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: "WrongPass1!" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  it("validates missing fields with 400", async () => {
    const res = await request(app).post("/api/auth/login").send({});

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});

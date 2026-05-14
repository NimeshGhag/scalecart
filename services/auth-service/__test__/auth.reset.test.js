const request = require("supertest");
const app = require("../src/app");
const userModel = require("../src/models/user.model");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");

describe("POST /api/auth/reset-password", () => {
  it("validates missing token or password with 400", async () => {
    const res = await request(app).post("/api/auth/reset-password").send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it("validates short new password with 400", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ token: "sometoken", newPassword: "123" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least 6 characters/i);
  });

  it("rejects when new password is same as old password", async () => {
    const payload = {
      name: "reset_same",
      email: "resetsame@example.com",
      password: "OldPassword1!",
    };

    const hashed = await bcrypt.hash(payload.password, 10);

    const user = await userModel.create({
      name: payload.name,
      email: payload.email,
      password: hashed,
      isVerified: true,
    });

    const token = JWT.sign({ id: user._id }, process.env.FORGOT_TOKEN_SECRET, {
      expiresIn: "10m",
    });

    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ token, newPassword: payload.password });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cannot be the same/i);
  });

  it("resets the password successfully", async () => {
    const payload = {
      name: "reset_success",
      email: "resetsuccess@example.com",
      password: "OldPassword2!",
    };

    const hashed = await bcrypt.hash(payload.password, 10);

    const user = await userModel.create({
      name: payload.name,
      email: payload.email,
      password: hashed,
      isVerified: true,
    });

    const token = JWT.sign({ id: user._id }, process.env.FORGOT_TOKEN_SECRET, {
      expiresIn: "10m",
    });

    const newPassword = "NewPassword3!";

    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ token, newPassword });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Password reset successful/i);

    const updated = await userModel.findById(user._id).select("+password");
    const matches = await bcrypt.compare(newPassword, updated.password);
    expect(matches).toBe(true);
  });
});

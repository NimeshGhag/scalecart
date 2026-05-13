const request = require("supertest");
const app = require("../src/app");
const bcrypt = require("bcryptjs");
const userModel = require("../src/models/user.model");

let lastEmail = {};

jest.mock("../src/utils/email.service", () => ({
  sendEmail: jest.fn((to, subject, text, html) => {
    lastEmail = { to, subject, text, html };
    return Promise.resolve();
  }),
}));

describe("Email verification and login flow", () => {
  it("registers user -> email sent; login blocked until verify; verify with token succeeds; invalid token fails; login after verify succeeds", async () => {
    const payload = {
      name: "verify_user",
      email: "verify@example.com",
      password: "Password123!",
    };

    // Register user (should trigger mocked sendEmail)
    const regRes = await request(app)
      .post("/api/auth/register")
      .send(payload)
      .expect(201);

    expect(lastEmail).toBeDefined();
    expect(lastEmail.to).toBe(payload.email);

    // Extract token from the sent email (text or html)
    const tokenMatch = (lastEmail.text || lastEmail.html).match(
      /token=([^\s"'>]+)/,
    );
    expect(tokenMatch).toBeTruthy();
    const token = tokenMatch[1];

    // Attempt login before verification -> blocked
    const blocked = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: payload.password });

    expect(blocked.status).toBe(401);
    expect(blocked.body.message).toMatch(/verify your email/i);

    // Verify with invalid token
    const bad = await request(app)
      .get("/api/auth/verify-email")
      .query({ token: "invalidtoken" });

    expect(bad.status).toBe(400);
    expect(bad.body.message).toMatch(/invalid|expired/i);

    // Verify with valid token
    const verifyRes = await request(app)
      .get("/api/auth/verify-email")
      .query({ token });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.message).toMatch(/verified/i);

    // Login after verification -> succeeds
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: payload.password });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.user).toBeDefined();
    expect(loginRes.body.user.email).toBe(payload.email);
  });
});

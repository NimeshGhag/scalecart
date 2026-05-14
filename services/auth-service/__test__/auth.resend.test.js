const request = require("supertest");
const app = require("../src/app");
const userModel = require("../src/models/user.model");
const { sendEmail } = require("../src/utils/email.service");

let sendEmailMock;

jest.mock("../src/utils/email.service", () => ({
  sendEmail: jest.fn(),
}));

beforeEach(() => {
  sendEmailMock = sendEmail;
  sendEmailMock.mockReset();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/auth/resend-verification", () => {
  it("validates missing email with 400", async () => {
    const res = await request(app)
      .post("/api/auth/resend-verification")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it("returns 404 when user not found", async () => {
    const res = await request(app)
      .post("/api/auth/resend-verification")
      .send({ email: "nouser@example.com" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBeDefined();
  });

  it("returns 200 when email already verified", async () => {
    const user = await userModel.create({
      name: "verified",
      email: "verified@example.com",
      password: "irrelevant",
      isVerified: true,
    });

    const res = await request(app)
      .post("/api/auth/resend-verification")
      .send({ email: user.email });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/already verified/i);
  });

  it("resends verification email successfully and respects rate limit", async () => {
    const payload = {
      name: "resend_user",
      email: "resend@example.com",
      password: "Password1!",
    };

    await userModel.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      isVerified: false,
    });

    // mock successful send
    let lastEmail = {};
    sendEmailMock.mockImplementation((to, subject, text, html) => {
      lastEmail = { to, subject, text, html };
      return Promise.resolve();
    });

    const first = await request(app)
      .post("/api/auth/resend-verification")
      .send({ email: payload.email });

    expect(first.status).toBe(200);
    expect(first.body.message).toMatch(/resent successfully/i);
    expect(lastEmail.to).toBe(payload.email);

    // immediate second request should be rate limited
    const second = await request(app)
      .post("/api/auth/resend-verification")
      .send({ email: payload.email });

    expect(second.status).toBe(429);
    expect(second.body.message).toMatch(/Please wait 60 seconds/i);
  });

  it("handles email sending failure gracefully", async () => {
    const payload = {
      name: "fail_user",
      email: "fail@example.com",
      password: "Password1!",
    };

    await userModel.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      isVerified: false,
    });

    sendEmailMock.mockImplementation(() =>
      Promise.reject(new Error("smtp fail")),
    );

    const res = await request(app)
      .post("/api/auth/resend-verification")
      .send({ email: payload.email });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Failed to send verification email/i);
  });
});

afterEach(() => {
  console.error.mockRestore();
});

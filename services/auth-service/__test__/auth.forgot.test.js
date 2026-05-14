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

describe("POST /api/auth/forgot-password", () => {
  it("validates missing email with 400", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it("returns 200 when user not found (should not leak existence)", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "nouser@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  it("sends reset email when user exists", async () => {
    const payload = {
      name: "forgot_user",
      email: "forgot@example.com",
      password: "Password1!",
    };

    await userModel.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      isVerified: true,
    });

    let lastEmail = {};
    sendEmailMock.mockImplementation((to, subject, text, html) => {
      lastEmail = { to, subject, text, html };
      return Promise.resolve();
    });

    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: payload.email });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/If the email is registered/i);
    expect(lastEmail.to).toBe(payload.email);
  });

  it("handles sendEmail failure gracefully", async () => {
    const payload = {
      name: "fail_user",
      email: "failforgot@example.com",
      password: "Password1!",
    };

    await userModel.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      isVerified: true,
    });

    sendEmailMock.mockImplementation(() => Promise.reject(new Error("smtp fail")));

    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: payload.email });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/If the email is registered/i);
  });
});

afterEach(() => {
  console.error.mockRestore();
});

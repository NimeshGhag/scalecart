const request = require("supertest");
const app = require("../src/app");

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
  });

  it("returns 200 even when not authenticated", async () => {
    const res = await request(app).post("/api/auth/logout").expect(200);

    expect(res.body.message).toBeDefined();
  });
});

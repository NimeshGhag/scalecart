const request = require("supertest");
const app = require("../src/app");
const bcrypt = require("bcryptjs");
const userModel = require("../src/models/user.model");

describe("Address routes - POST /me/add-address & DELETE /me/delete-address/:addressId", () => {
  it("adds an address for authenticated user (201)", async () => {
    const payload = {
      name: "addr_user",
      email: "addr@example.com",
      password: "Secret123!",
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

    const cookies = loginRes.headers["set-cookie"];

    const addressPayload = {
      street: "123 Test St",
      city: "Testville",
      state: "TS",
      zip: "12345",
      country: "Testland",
      isDefault: true,
    };

    const res = await request(app)
      .post("/api/auth/me/add-address")
      .set("Cookie", cookies)
      .send(addressPayload);

    expect(res.status).toBe(201);
    expect(res.body.address).toBeDefined();
    expect(res.body.address.street).toBe(addressPayload.street);
    expect(res.body.address.city).toBe(addressPayload.city);
    expect(res.body.address.country).toBe(addressPayload.country);
    expect(res.body.address._id).toBeDefined();
  });

  it("deletes an existing address (200) and returns 404 when not found", async () => {
    const payload = {
      name: "del_user",
      email: "del@example.com",
      password: "Secret123!",
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

    const cookies = loginRes.headers["set-cookie"];

    const addressPayload = {
      street: "456 Remove Rd",
      city: "RemoveCity",
      state: "RV",
      zip: "67890",
      country: "Nowhere",
      isDefault: false,
    };

    const addRes = await request(app)
      .post("/api/auth/me/add-address")
      .set("Cookie", cookies)
      .send(addressPayload);

    expect(addRes.status).toBe(201);
    const addressId = addRes.body.address._id;
    expect(addressId).toBeDefined();

    const delRes = await request(app)
      .delete(`/api/auth/me/delete-address/${addressId}`)
      .set("Cookie", cookies);

    expect(delRes.status).toBe(200);
    expect(delRes.body.message).toMatch(/deleted/i);

    // deleting again should return 404
    const delAgain = await request(app)
      .delete(`/api/auth/me/delete-address/${addressId}`)
      .set("Cookie", cookies);

    expect(delAgain.status).toBe(404);
  });
});

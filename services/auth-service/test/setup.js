const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.setTimeout(30000); // Increase timeout to 30 seconds
let mongo;

beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = "test";

  // Start in-memory MongoDB
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  process.env.MONGODB_URI = uri; // ensure app's db connector uses this
  process.env.JWT_SECRET = "test_jwt_secret"; // set a test JWT secret
  process.env.EMAIL_TOKEN_SECRET = "test_email_secret";
  process.env.FORGOT_TOKEN_SECRET = "test_forgot_secret";
  process.env.BASE_URL = "http://localhost";

  process.env.EMAIL_USER = "test@example.com";
  process.env.EMAIL_PASS = "testpass";

  await mongoose.connect(uri);
});

afterEach(async () => {
  // Cleanup all collections between tests
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongo) await mongo.stop();
});

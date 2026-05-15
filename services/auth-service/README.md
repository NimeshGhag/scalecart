# Auth Service

Production-ready authentication service for ScaleCart built using Node.js, Express, MongoDB, JWT, Redis, and Jest.

---

## 🚀 Features

* User Registration
* Secure Login System
* JWT Authentication
* Refresh Token Rotation
* Refresh Token Blacklisting
* Logout with Token Invalidation
* Email Verification
* Resend Verification Email
* Forgot Password
* Reset Password
* Address Management APIs
* Redis Token Blacklisting
* Cookie-based Authentication
* Integration Testing with Jest & Supertest

---

## 🛠 Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT (JSON Web Tokens)
* Redis
* Nodemailer
* Jest
* Supertest
* bcryptjs

---

## 📂 Project Structure

```bash
src/
│
├── controllers/
├── routes/
├── middleware/
├── models/
├── utils/
├── db/
└── app.js
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
BASE_URL=
MONGODB_URI=

JWT_SECRET=
FORGOT_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=

REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=

EMAIL_USER=
EMAIL_PASS=
EMAIL_TOKEN_SECRET=
```

---

## ▶️ Installation

```bash
npm install
```

---

## ▶️ Run Development Server

```bash
npm run dev
```

---

## 🧪 Run Tests

Run all tests:

```bash
npm test
```

Run a specific test file:

```bash
npm test auth.login.test.js
```

---

## 🔐 Authentication Flow

### Login Flow

1. User submits email and password.
2. Credentials are validated.
3. Access token is generated.
4. Refresh token is generated.
5. Refresh token is stored in MongoDB.
6. Both tokens are stored in HTTP-only cookies.

### Refresh Token Rotation

1. Client sends refresh token cookie.
2. Server verifies token and checks MongoDB.
3. New access token is generated.
4. New refresh token is generated.
5. Existing refresh token record is replaced.
6. New cookies are sent to the client.

### Logout Flow

1. Access token is blacklisted in Redis.
2. Refresh token is blacklisted in Redis.
3. Refresh token is deleted from MongoDB.
4. Access and refresh token cookies are cleared.

---

## 📌 API Endpoints

### Authentication Routes

| Method | Route                                 | Description                                     |
| ------ | ------------------------------------- | ----------------------------------------------- |
| POST   | `/api/auth/register`                  | Register a new user                             |
| POST   | `/api/auth/login`                     | Login user                                      |
| POST   | `/api/auth/logout`                    | Logout user                                     |
| GET    | `/api/auth/me`                        | Get current authenticated user                  |
| POST   | `/api/auth/verify-email`              | Verify email address                            |
| POST   | `/api/auth/resend-verification-email` | Resend verification email                       |
| POST   | `/api/auth/forgot-password`           | Send password reset email                       |
| POST   | `/api/auth/reset-password`            | Reset password                                  |
| POST   | `/api/auth/refresh-token`             | Rotate refresh token and issue new access token |

### Address Routes

| Method | Route                                    | Description             |
| ------ | ---------------------------------------- | ----------------------- |
| GET    | `/api/auth/me/address`                   | Get all saved addresses |
| POST   | `/api/auth/me/add-address`               | Add a new address       |
| DELETE | `/api/auth/me/delete-address/:addressId` | Delete an address       |

---

## 🔒 Security Features

* Password hashing using bcrypt
* HTTP-only cookies
* JWT-based authentication
* Refresh token rotation
* Refresh token storage in MongoDB
* Redis token blacklisting
* Email verification before login
* Protected routes using authentication middleware

---

## 🧪 Testing Coverage

Implemented integration tests for:

* Register
* Login
* Logout
* Current User (`/me`)
* Email Verification
* Resend Verification Email
* Forgot Password
* Reset Password
* Refresh Token
* Address APIs

---

## 📈 Future Improvements

* Google OAuth Authentication
* Message Broker Integration (RabbitMQ/Kafka)
* Optimize independent database operations using `Promise.all()`
* Rate Limiting
* Session Monitoring Dashboard
* API Gateway Integration
* Event-Driven Microservice Architecture
* Device-Based Session Tracking

---

## 👨‍💻 Author

Built by **Nimesh Ghag**

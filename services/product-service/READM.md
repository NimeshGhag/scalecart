# Product Service

This service manages product data for the ScaleCart application: create, read, update, delete products, and handle seller-specific queries and image uploads.

## Table of Contents

- Overview
- Requirements
- Setup
- Environment Variables
- Running
- API Endpoints
- Testing
- Project Structure

## Overview

The Product Service provides REST endpoints to manage products stored in the database. It includes validation and authentication middleware and integrates with ImageKit for image uploads.

## Requirements

- Node.js 16+ (recommended)
- npm
- A running database (MongoDB)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file from your environment template and set required variables (see below).

## Environment Variables

- `PORT` — port to run the service (default: 3000)
- `DB_URL` — database connection string
- `JWT_SECRET` — secret for signing JWTs
- `IMAGEKIT_PUBLIC_KEY` — ImageKit public key
- `IMAGEKIT_PRIVATE_KEY` — ImageKit private key
- `IMAGEKIT_URL_ENDPOINT` — ImageKit URL endpoint

## Running

- Start in development:

```bash
npm run dev
```

- Start production:

```bash
npm start
```

## API Endpoints

All endpoints are mounted under `/products` (see `src/routes/product.route.js`). Key endpoints:

- `POST /products` — Create a new product (auth + validation)
- `GET /products` — Get list of products (query filters supported)
- `GET /products/:id` — Get product by ID
- `PUT /products/:id` — Update product by ID (auth + validation)
- `DELETE /products/:id` — Delete product by ID (auth)
- `GET /products/seller/:sellerId` — Get products for a seller

Middleware of interest:

- `src/middlewares/auth.middleware.js` — protects routes requiring authentication
- `src/middlewares/validator.middleware.js` — validates request payloads

Image handling is delegated to `src/services/imagekit.service.js`.

## Testing

Unit and integration tests are in `src/__test__` and `test/setup.js`. Run tests with:

```bash
npm run test
```

## Project Structure

- `src/controllers` — route handlers (e.g. `product.controller.js`)
- `src/models` — data models (e.g. `product.model.js`)
- `src/routes` — express routes (e.g. `product.route.js`)
- `src/services` — external integrations (e.g. `imagekit.service.js`)
- `src/middlewares` — auth and validation middleware
- `src/__test__` — test files for controllers and routes
- `db` — database connection helpers
- `utils` — helper utilities (e.g. `stock.utils.js`)

## Contributing

Please follow existing code patterns. Run tests locally before opening PRs.

---

Updated for the Product Service in this workspace.

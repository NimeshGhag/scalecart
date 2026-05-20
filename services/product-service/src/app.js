const express = require("express");
const cookieParser = require("cookie-parser");
const productRoute = require("../src/routes/product.route");

const app = express();

//Middlewares
app.use(express.json());
app.use(cookieParser());

//Routes
app.use("/api/products", productRoute);

module.exports = app;

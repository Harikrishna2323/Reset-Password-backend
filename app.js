const express = require("express");
const app = express();
const authRouter = require("./routes/auth");

app.use(express.json());

app.use("/", authRouter);

module.exports = app;

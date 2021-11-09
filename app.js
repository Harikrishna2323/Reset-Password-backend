const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const cors = require("cors");

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true }));

app.use("/api/v1", authRouter);

module.exports = app;

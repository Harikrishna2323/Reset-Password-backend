const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const authRouter = require("./routes/auth");
const cors = require("cors");
app.use(cors({ origin: true }));

app.use(express.json());

app.use("/api/v1", authRouter);

module.exports = app;

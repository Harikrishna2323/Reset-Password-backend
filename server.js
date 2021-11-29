const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });

const PORT = process.env.PORT || 4000;

const connectDatabase = () => {
  mongoose
    .connect(`${process.env.DB_URI}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((con) => {
      console.log(
        `Mongodb Database connected with HOST: ${con.connection.host}`
      );
    });
};
connectDatabase();

const server = app.listen(PORT, () =>
  console.log(`Server started in port: ${PORT} in ${process.env.NODE_ENV}`)
);

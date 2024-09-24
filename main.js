require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
const mongoose = require("mongoose");
const session = require("express-session");

//database
mongoose.connect(process.env.MONGODBB_URI);
const db = mongoose.connection;
db.on("error", (error) => console.error());
db.once("open", () => console.log("connected database"));
////////////////////////////////////////

//midlwares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false,
  })
);
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});
app.use(express.static("./routes/uploads"));
///////////////////////////////////////////

//template engin
app.set("view engine", "ejs");

//route prifex
app.use("", require("./routes/routes"));

////////////////////////////////////////

app.listen(port, () => console.log(`server is : http://localhost:${port}`));

const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");
const { Types } = require("mongoose");
const users = require("../models/users");
const { type } = require("os");

//image uploade
var storerge = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "A:\\Progect\\Node.Js\\Crud\\routes\\uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now + file.originalname);
  },
});
var upload = multer({
  storage: storerge,
}).single("image");
////////////////////////////////////////////
//insert to db
router.post("/add", upload, async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: req.file.filename,
  });

  try {
    await user.save();
    req.session.message = {
      type: "success",
      message: "User Added Successfully",
    };
    res.redirect("/");
  } catch (err) {
    res.json({
      message: err.message,
      type: "danger",
    });
  }
});
// get all user
router.get("/", (req, res) => {
  User.find()
    .exec()
    .then((users) => {
      res.render("index", {
        title: "Home Page",
        users: users,
      });
    })
    .catch((err) => {
      res.render("index", {
        title: "Home Page",
        users: [],
      });
    });
});

router.get("/add", (req, res) => {
  res.render("add_users", { title: "add users" });
});
router.get("/about", (req, res) => {
  res.render("about", { title: "about" });
});
router.get("/contact", (req, res) => {
  res.render("contact", { title: "contact" });
});

//edit route
router.get("/edit/:id", (req, res) => {
  let id = req.params.id;
  User.findById(id)
    .then((user) => {
      if (user == null) {
        res.render("/", {
          title: "edit user",
          user: [],
        });
      } else {
        res.render("../views/edit_user.ejs", {
          title: "edit user",
          user: user,
        });
      }
    })
    .catch((err) => {
      console.error(err);
      res.redirect("/");
    });
});

// update user route
router.post("/update/:id", upload, async (req, res) => {
  try {
    const id = req.params.id;
    let newimage = "";

    if (req.file) {
      newimage = req.file.filename;
      try {
        fs.unlinkSync("./uploads/" + req.body.old_image);
      } catch (err) {
        console.log(err);
      }
    } else {
      newimage = req.body.old_image;
    }

    const result = await User.findByIdAndUpdate(id, {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: newimage,
    });

    req.session.message = {
      type: "success",
      message: "Update Completed",
    };
    res.redirect("/");
  } catch (err) {
    console.error(err);
    // Handle error
    res.redirect("/");
  }
});
//delete user route
router.get("/delete/:id", (req, res) => {
  let id = req.params.id;

  User.findByIdAndDelete(id)
    .then((result) => {
      if (result && result.image !== "") {
        try {
          fs.unlinkSync("./uploads/" + result.image);
        } catch (err) {
          console.log(err);
        }
      }
      req.session.message = {
        type: "info",
        message: "dselete complated",
      };
      res.redirect("/");
    })
    .catch((err) => {
      res.json({ message: err.message });
    });
});

module.exports = router;

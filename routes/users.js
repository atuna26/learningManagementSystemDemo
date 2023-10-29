const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Lesson = require("../models/Lesson");

async function LoadRoleInfo(req, res, next) {
  const user = await User.findOne({ _id: req.session.userId });
  if (user) {
    const userData = {
      userName: user.userName,
      role: user.role,
    };
    req.userData = userData;
  }
  next();
}

router.use(LoadRoleInfo);

router.get("/", (req, res) => {
  User.find({})
    .lean()
    .then((user) => {
      res.render("site/users", { user: user, userData: req.userData });
    });
});

router.get("/login", (req, res) => {
  if (!req.session.userId) {
    res.render("site/login", { layout: "" });
  } else {
    res.redirect("/");
  }
});

router.get("/student", (req, res) => {
  User.find({ role: "Student" })
    .lean()
    .then((user) => {
      res.render("site/students", { user: user, userData: req.userData });
    });
});

router.get("/teacher", (req, res) => {
  User.find({ role: "Teacher" })
    .lean()
    .then((user) => {
      Lesson.find()
        .lean()
        .then((lesson) => {
          res.render("site/teachers", {
            user: user,
            userData: req.userData,
            lessson: lesson,
          });
        });
    });
});
router.get("/register", (req, res) => {
  res.render("site/register", { userData: req.userData });
});

router.post("/login", async (req, res) => {
  const { mailAddress, password } = req.body;
  try {
    const user = await User.findOne({ mailAddress: mailAddress });
    if (user) {
      if (user.password == password) {
        req.session.userId = user._id;
        res.redirect("/");
      } else {
        res.redirect("/login");
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Bir hata oluştu.");
  }
});

router.post("/register", (req, res) => {
  User.create({ ...req.body }).then((user, error) => {
    if (user) {
      req.session.sessionFlash = {
        type: "info",
        message: "Succesfull",
      };
      res.redirect("/users/register");
    }
    if (error) {
      req.session.sessionFlash = {
        type: "error",
        message: "Error Code" + error,
      };
      res.redirect("/users/register");
    }
  });
});

router.post("/register/teacher", async (req, res) => {
  if (req.body.lesson) {
    await Lesson.find({ _id: req.body.lesson }).then((lesson) => {
      console.log(lesson);
      User.create({ ...req.body, role: "Teacher" }).then((user, error) => {
        if (user.role === "Teacher") {
          for (const lessons of lesson) {
            lessons.lessonTeacher.push(user._id);
            lessons.save();
          }
          res.redirect("/users/teacher");
        }
        if (error) {
          req.session.sessionFlash = {
            type: "error",
            message: "Error Code" + error,
          };
          res.redirect("/users/register");
        }
      });
    });
  }else{
    User.create({...req.body}).then(user=>{
      res.redirect("/users/teacher")
    })
  }
});



router.post("/register/student", (req, res) => {
  User.create({ ...req.body,role:"Student" }).then((user, error) => {
    if (user) {
      req.session.sessionFlash = {
        type: "info",
        message: "Succesfull",
      };
      res.redirect("/users/student");
    }
    if (error) {
      req.session.sessionFlash = {
        type: "error",
        message: "Error Code" + error,
      };
      res.redirect("/users/register");
    }
  });
});


router.post("/logout",(req,res)=>{
  req.session.userId = null
  res.redirect("/users/login");
})

module.exports = router;

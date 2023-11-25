const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Form = require("../models/Form");
const Lesson = require("../models/Lesson");
const WeeklyTable = require("../models/WeeklyTable");
const PlannedTimetable = require("../models/PlannedTimetable");
const RequestPlannedTimetable = require("../models/requestPlannedTimetable");
const Notification = require("../models/Notification")

async function LoadRoleInfo(req, res, next) {
  const user = await User.findOne({ _id: req.session.userId });
  if (user) {
    const userData = {
      userName: user.userName,
      role: user.role,
      id: user._id,
      currentWeek: "1",
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
        res.render("site/accounting/main", { user, userData: req.userData, });
    });
});

router.post("/change", (req, res) => {
  if (req.body.action === "send") {
    User.find({ _id: req.body.selected }).then((user) => {
      user.forEach((user) => {
        if (req.body.moneyToBePaid) {
          user.moneyToBePaid = req.body.moneyToBePaid;
        }

        if (req.body.moneyPaid) {
          user.moneyPaid = req.body.moneyPaid;
          if(user.role=="Teacher"){
            Notification.create({
              title:"You've got a new payment.",
              symbol:'fa-solid fa-money-bill-trend-up',
              color:"media-success",
              gettingUser:user._id,
            })
          }
        }

        if (req.body.feePerLesson) {
          user.feePerLesson = req.body.feePerLesson;
        }
        
        user.save();
      });

      res.redirect("/accounting");
    });
  } else if (req.body.action === "balance") {
    User.find({ _id: req.body.selected }).then((user) => {
      user.forEach((user) => {
        user.moneyPaid = user.moneyToBePaid;
        if(user.role=="Teacher"){
          Notification.create({
            title:"You've got a new payment.",
            symbol:'<i class="fa-solid fa-money-bill-trend-up"></i>',
            color:"media-success",
            gettingUser:user._id,
          })
        }
        user.save();
      });

      res.redirect("/accounting");
    });
  }
});

module.exports = router;

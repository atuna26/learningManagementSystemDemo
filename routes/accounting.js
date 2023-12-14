const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Form = require("../models/Form");
const Lesson = require("../models/Lesson");
const WeeklyTable = require("../models/WeeklyTable");
const PlannedTimetable = require("../models/PlannedTimetable");
const RequestPlannedTimetable = require("../models/requestPlannedTimetable");
const Notification = require("../models/Notification");
const PaymentHistory = require("../models/PaymentHistory");

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

router.get("/students", (req, res) => {
  let link = "student";
  User.find({role:"Student"})
    .lean()
    .then((user) => {
      res.render("site/accounting/main", { link,user, userData: req.userData });
    });
});
router.get("/teachers", (req, res) => {
  let link = "teacher"
  User.find({role:"Teacher"})
    .lean()
    .then((user) => {
      res.render("site/accounting/main", {link, user, userData: req.userData });
    });
});

router.get("/t-account", async (req, res) => {
  try {
    let totalOutgoing = 0;
    let totalIncoming = 0;
    let startD = new Date("1.1.1900")
    let endD = new Date("1.1.2900")
    if(req.query.startDate&&req.query.endDate){
      startD = new Date(req.query.startDate)
      endD = new Date(req.query.endDate)
    }

    // Tüm ödemeleri al
    const paymentHistory = await PaymentHistory.find({
      date:{
        $gte:startD,
        $lte:endD
      }
    }).sort({date:-1}).lean();

    // Giden ödemeleri al ve topla
    const outgoing = await PaymentHistory.find({ type: "outgoing", date:{
      $gte:startD,
      $lte:endD
    } }).lean();
    outgoing.forEach((item) => {
      totalOutgoing += Number(item.amount);
    });

    // Gelen ödemeleri al ve topla
    const incoming = await PaymentHistory.find({ type: "incoming", date:{
      $gte:startD,
      $lte:endD
    } }).lean();
    incoming.forEach((item) => {
      totalIncoming += Number(item.amount);
    });

    // res.render'ı burada çağır
    res.render("site/accounting/taccount", {
      paymentHistory,
      userData: req.userData,
      totalOutgoing,
      totalIncoming,startD,endD
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post("/t-account/history", async(req,res)=>{
  let startDate=req.body.startDate
  let endDate = req.body.endDate
  res.redirect(`/accounting/t-account?startDate=${startDate}&endDate=${endDate}`)

})


router.post("/change/teacher", async (req, res) => {
  if (req.body.action === "send") {
    try {
      let totalMoney = 0;

      const users = await User.find({ _id: req.body.selected });

      for (const user of users) {
        if (req.body.moneyToBePaid) {
          user.moneyToBePaid = req.body.moneyToBePaid;
        }

        if (req.body.moneyPaid) {
          totalMoney += Number(req.body.moneyPaid);
          user.moneyPaid = req.body.moneyPaid;
          if (user.role == "Teacher") {
            await Notification.create({
              title: "Yeni bir ödeme aldınız.",
              symbol: "fa-solid fa-money-bill-trend-up",
              color: "media-success",
              gettingUser: user._id,
            });
          }
        }

        if (req.body.feePerLesson) {
          user.feePerLesson = req.body.feePerLesson;
        }

        await user.save();
      }

      if (req.body.moneyPaid) {
        await PaymentHistory.create({
          type: "outgoing",
          amount: totalMoney,
          user: users,
        });
      }

      res.redirect("/accounting/teachers");
    } catch (error) {
      console.error(error);
      res.status(500).send("İç Sunucu Hatası");
    }
  } else if (req.body.action === "balance") {
    try {
      let totalMoney = 0;

      const users = await User.find({ _id: req.body.selected });

      for (const user of users) {
        let diff= Number(user.moneyToBePaid) - Number(user.moneyPaid)
        totalMoney = totalMoney + diff;
        user.moneyPaid = user.moneyToBePaid;
        if (user.role == "Teacher") {
          await Notification.create({
            title: "Yeni bir ödeme aldınız.",
            symbol: '<i class="fa-solid fa-money-bill-trend-up"></i>',
            color: "media-success",
            gettingUser: user._id,
          });
        }
        await user.save();
      }

      await PaymentHistory.create({
        type: "outgoing",
        amount: totalMoney,
        user: users,
      });

      res.redirect("/accounting/teachers");
    } catch (error) {
      console.error(error);
      res.status(500).send("İç Sunucu Hatası");
    }
  }
});

router.post("/change/student", async (req, res) => {
  if (req.body.action === "send") {
    try {
      let totalMoney = 0;

      const users = await User.find({ _id: req.body.selected });

      for (const user of users) {
        if (req.body.moneyToBePaid) {
          user.moneyToBePaid = req.body.moneyToBePaid;
        }

        if (req.body.moneyPaid) {
          totalMoney += Number(req.body.moneyPaid);
          user.moneyPaid = req.body.moneyPaid;
        }

        if (req.body.feePerLesson) {
          user.feePerLesson = req.body.feePerLesson;
        }

        await user.save();
      }

      if (req.body.moneyPaid) {
        await PaymentHistory.create({
          type: "incoming",
          amount: totalMoney,
          user: users,
        });
      }

      res.redirect("/accounting/students");
    } catch (error) {
      console.error(error);
      res.status(500).send("İç Sunucu Hatası");
    }
  } else if (req.body.action === "balance") {
    try {
      let totalMoney = 0;

      const users = await User.find({ _id: req.body.selected });

      for (const user of users) {
        let diff= Number(user.moneyToBePaid) - Number(user.moneyPaid)
        totalMoney = totalMoney + diff;
        user.moneyPaid = user.moneyToBePaid;
        await user.save();
      }

      await PaymentHistory.create({
        type: "incoming",
        amount: totalMoney,
        user: users,
      });

      res.redirect("/accounting/students");
    } catch (error) {
      console.error(error);
      res.status(500).send("İç Sunucu Hatası");
    }
  }
});


module.exports = router;

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const WeeklyTable = require("../models/WeeklyTable")
const Lesson = require("../models/Lesson")

async function LoadRoleInfo(req, res, next) {
  const user = await User.findOne({ _id: req.session.userId });
  if(user){
    const userData ={
      userName:user.userName,
      role:user.role,
      id:user._id,
      currentWeek:"10"
    }
    req.userData=userData
  }
  next();
 
}

router.use(LoadRoleInfo);


router.get("/formDemo",(req,res)=>{
  res.render("site/teacherformdemo",{ layout: "" })
})

router.get("/", async (req, res) => { 
  const user = await User.findOne({_id:req.session.userId})
  const userId = user._id
  const numberTea = (await User.find({role:"Teacher"})).length
  const numberStu = (await User.find({role:"Student"})).length
  WeeklyTable.find().populate({path:"courses.teacherName", model:"User"}).populate({path:"courses.studentName", model:"User"}).populate({path:"courses.courseCode", model:"Lesson"}).sort({week:1}).lean().then(weeklyTable=>{
   User.find().lean().then(user=>{
    Lesson.find().lean().then(lesson=>{
      res.render("site/index",{userData:req.userData,numberTea,numberStu,weeklyTable,userId,lesson:lesson,user:user});

    })
   })
  })
});

router.get("/dashboard",(req, res) => {
  res.redirect("/")
});


module.exports = router;

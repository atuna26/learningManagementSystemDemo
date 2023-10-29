const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Lesson = require("../models/Lesson")
const WeeklyTable = require("../models/WeeklyTable")

async function LoadRoleInfo(req, res, next) {
    const user = await User.findOne({ _id: req.session.userId });
    if(user){
      const userData ={
        userName:user.userName,
        role:user.role,
      }
      req.userData=userData
    }
    next();
   
  }
  
  router.use(LoadRoleInfo);
  

router.get("/course-list", (req,res)=>{
  User.find({}).lean().then(user=>{
    Lesson.find({}).lean().then(lesson=>{
      res.render("site/courses",{userData:req.userData,user:user,lesson:lesson})
    })
  })
})

router.get("/course-registration", (req,res)=>{
  User.find({}).lean().then(user=>{
    Lesson.find({}).lean().then(lesson=>{
      WeeklyTable.find({}).populate({path:"courses.teacherName", model:"User"}).populate({path:"courses.studentName", model:"User"}).populate({path:"courses.courseCode", model:"Lesson"}).lean().then(weeklyTable=>{
        res.render("site/courseRegistration",{userData:req.userData,user:user,lesson:lesson,weeklyTable:weeklyTable})
      })
    })
  })
})


router.post("/course-registration", async (req,res)=>{
  const weeklyTable = await WeeklyTable.findOne({week:req.body.week,year:req.body.year})
  if(weeklyTable){
    weeklyTable.courses.push({
      courseCode:req.body.courseCode,
      studentName:req.body.studentName,
      teacherName:req.body.teacherName,
      courseHour:req.body.courseHour,
      courseMinute:req.body.courseMinute,
      courseEndHour:req.body.courseEndHour,
      courseEndMinute:req.body.courseEndMinute,
      courseDay:req.body.courseDay,
      courseType:req.body.courseType,
    })
    weeklyTable.save()
    res.redirect("/course/course-registration")
  }
  else{
    WeeklyTable.create({
      week:req.body.week,
      year:req.body.year
    }).then(weeklytable=>{
      weeklytable.courses.push({
      courseCode:req.body.courseCode,
      studentName:req.body.studentName,
      teacherName:req.body.teacherName,
      courseHour:req.body.courseHour,
      courseMinute:req.body.courseMinute,
      courseEndHour:req.body.courseEndHour,
      courseEndMinute:req.body.courseEndMinute,
      courseDay:req.body.courseDay,
      courseType:req.body.courseType,
      })
      weeklytable.save()
    })
    res.redirect("/course/course-registration")
  }
})



router.post("/new-lesson", async(req,res)=>{
  await User.find({_id:req.body.lessonTeacher}).then(user=>{
  Lesson.create({...req.body}).then(lesson=>{
    for (const teacher of user){
      teacher.lesson.push(lesson._id)
      teacher.save()
    }
    res.redirect("/course/couse-list")
  })
  })
})


module.exports = router;

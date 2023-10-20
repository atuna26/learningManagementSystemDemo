const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Lesson = require("../models/Lesson")
const Timetable = require("../models/Timetable")

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
      res.render("site/courseRegistration",{userData:req.userData,user:user,lesson:lesson})
    })
  })
})


router.post("/course-registration",(req,res)=>{

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

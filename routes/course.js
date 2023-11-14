const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Lesson = require("../models/Lesson");
const WeeklyTable = require("../models/WeeklyTable");
const PlannedTimetable = require("../models/PlannedTimetable");
const RequestPlannedTimetable = require("../models/requestPlannedTimetable")

async function LoadRoleInfo(req, res, next) {
  const user = await User.findOne({ _id: req.session.userId });
  if (user) {
    const userData = {
      userName: user.userName,
      role: user.role,
      id:user._id,
      currentWeek: "10",
    };
    req.userData = userData;
  }
  next();
}

router.use(LoadRoleInfo);

/*PLANNED TABLE */
router.get("/plannedTable", (req, res) => {
  User.find({})
    .lean()
    .then((user) => {
      Lesson.find({})
        .lean()
        .then((lesson) => {
          PlannedTimetable.find({})
            .populate({ path: "teacherName", model: "User" })
            .populate({ path: "studentName", model: "User" })
            .populate({ path: "courseCode", model: "Lesson" })
            .lean()
            .then((courses) => {
              res.render("site/courses/coursePlanned", {
                userData: req.userData,
                user: user,
                lesson: lesson,
                courses: courses,
              });
            });
        });
    });
});

router.post("/plannedTable/desicion",(req,res)=>{
  if(req.body.action==="send"){
    PlannedTimetable.find({_id:req.body.selected}).then(plannedTimetable=>{
      WeeklyTable.find({}).then(weeklyTable=>{
        weeklyTable.forEach(weeklyTable=>{
          plannedTimetable.forEach(plannedTimetable=>{
            weeklyTable.courses.push({
              courseCode: plannedTimetable.courseCode,
              studentName: plannedTimetable.studentName,
              teacherName: plannedTimetable.teacherName,
              courseHour: plannedTimetable.courseHour,
              courseMinute: plannedTimetable.courseMinute,
              courseEndHour: plannedTimetable.courseEndHour,
              courseEndMinute: plannedTimetable.courseEndMinute,
              courseDay: plannedTimetable.courseDay,
              courseType: plannedTimetable.courseType,
            })
          })
          weeklyTable.save()
        })
          res.redirect("/course/plannedTable")
      })
    })
  }else if(req.body.action==="delete"){
    PlannedTimetable.deleteMany({ _id: { $in:  req.body.selected} }).then(
      (plannedTimetable) => {
        res.redirect("/course/plannedTable");
      }
    );
  }
})


router.delete("/plannedTable/delete/:id", (req, res) => {
  PlannedTimetable.findOneAndRemove({ _id: req.params.id }).then(
    (plannedTimetable) => {
      res.redirect("/course/plannedTable");
    }
  );
});

router.get("/plannedTable/filtered", async (req, res) => {
  const teacher = req.query.teacher;
  const student = req.query.student;
  console.log(req.query.student);
  User.find({})
    .lean()
    .then((user) => {
      Lesson.find({})
        .lean()
        .then((lesson) => {
          PlannedTimetable.find({
            teacherName: teacher,
            studentName: student,
          })
            .populate({ path: "teacherName", model: "User" })
            .populate({ path: "studentName", model: "User" })
            .populate({ path: "courseCode", model: "Lesson" })
            .lean()
            .then((courses) => {
              res.render("site/courses/coursePlanned", {
                userData: req.userData,
                user: user,
                lesson: lesson,
                courses: courses,
              });
            });
        });
    });
});

router.post("/plannedTable/toAllWeek/:id",(req,res)=>{
  PlannedTimetable.findOne({_id:req.params.id}).then(plannedTimetable=>{
    WeeklyTable.find({}).then(weeklyTable=>{
      weeklyTable.forEach(weeklyTable=>{
        weeklyTable.courses.push({
          courseCode: plannedTimetable.courseCode,
          studentName: plannedTimetable.studentName,
          teacherName: plannedTimetable.teacherName,
          courseHour: plannedTimetable.courseHour,
          courseMinute: plannedTimetable.courseMinute,
          courseEndHour: plannedTimetable.courseEndHour,
          courseEndMinute: plannedTimetable.courseEndMinute,
          courseDay: plannedTimetable.courseDay,
          courseType: plannedTimetable.courseType,
        })
        weeklyTable.save()
      })
        res.redirect("/course/plannedTable")
    })
  })
})

router.post("/filter-plannedTable", (req, res) => {
  res.redirect(
    `/course/plannedTable/filtered/?teacher=${req.body.teacher}&student=${req.body.student}`
  );
});

/** Course List */
router.get("/course-list", (req, res) => {
  User.find({})
    .lean()
    .then((user) => {
      Lesson.find({})
        .lean()
        .then((lesson) => {
          res.render("site/courses/courses", {
            userData: req.userData,
            user: user,
            lesson: lesson,
          });
        });
    });
});

router.post("/new-lesson", async (req, res) => {
  await User.find({ _id: req.body.lessonTeacher }).then((user) => {
    Lesson.create({ ...req.body }).then((lesson) => {
      for (const teacher of user) {
        teacher.lesson.push(lesson._id);
        teacher.save();
      }
      res.redirect("/course/couse-list");
    });
  });
});



/** Course Timelist */
router.get("/course-timeList", (req, res) => {
  User.find({})
    .lean()
    .then((user) => {
      Lesson.find({})
        .lean()
        .then((lesson) => {
          WeeklyTable.find({})
            .populate({ path: "courses.teacherName", model: "User" })
            .populate({ path: "courses.studentName", model: "User" })
            .populate({ path: "courses.courseCode", model: "Lesson" })
            .lean()
            .then((weeklyTable) => {
              res.render("site/courses/courseList", {
                userData: req.userData,
                user: user,
                lesson: lesson,
                weeklyTable: weeklyTable,
              });
            });
        });
    });
});

router.get("/course-timeList/filtered", async (req, res) => {
  const week = req.query.week;
  const teacher = req.query.teacher;
  const student = req.query.student;
  console.log(req.query.student);
  User.find({})
    .lean()
    .then((user) => {
      Lesson.find({})
        .lean()
        .then((lesson) => {
          WeeklyTable.find({
            week: week,
            "courses.teacherName": teacher,
            "courses.studentName": student,
          })
            .populate({ path: "courses.teacherName", model: "User" })
            .populate({ path: "courses.studentName", model: "User" })
            .populate({ path: "courses.courseCode", model: "Lesson" })
            .lean()
            .then((weeklyTable) => {
              res.render("site/courses/courseList", {
                userData: req.userData,
                user: user,
                lesson: lesson,
                weeklyTable: weeklyTable,
              });
              console.log(weeklyTable);
            });
        });
    });
});



router.post("/course-timelist/desicion",(req,res)=>{
  if(req.body.action==="send"){
    let courseAddToPlanned
    WeeklyTable.find({ "courses._id": req.body.selected }).then((weeklyTable) => {
      weeklyTable.forEach(weeklytable=>{
        courseAddToPlanned = weeklytable.courses.find(
          (course) => (course._id = req.body.selected)
        );
        PlannedTimetable.create({
          courseCode: courseAddToPlanned.courseCode,
          teacherName: courseAddToPlanned.teacherName,
          studentName: courseAddToPlanned.studentName,
          courseType: courseAddToPlanned.courseType,
          courseDay: courseAddToPlanned.courseDay,
          courseHour: courseAddToPlanned.courseHour,
          courseMinute: courseAddToPlanned.courseMinute,
          courseEndHour: courseAddToPlanned.courseEndHour,
          courseEndMinute: courseAddToPlanned.courseEndMinute,
        })
      })
        res.redirect("/course/course-timeList");
    });
  }else if(req.body.action==="delete"){
   WeeklyTable.updateMany( { "courses._id": { $in: req.body.selected } },
   { $pull: { courses: { _id: { $in: req.body.selected } } } }).then((weeklyTable)=>{
    res.redirect("/course/course-timeList");
   })
  }
})

router.post("/filter-courseList", (req, res) => {
  res.redirect(
    `/course/course-timeList/filtered/?week=${req.body.week}&teacher=${req.body.teacher}&student=${req.body.student}`
  );
});

/**Course Registration */
router.get("/course-registration", async (req, res) => {
  const user = await User.findOne({ _id: req.session.userId });
  const userId = user._id;
  User.find({})
    .lean()
    .then((user) => {
      Lesson.find({})
        .lean()
        .then((lesson) => {
          WeeklyTable.find({})
            .populate({ path: "courses.teacherName", model: "User" })
            .populate({ path: "courses.studentName", model: "User" })
            .populate({ path: "courses.courseCode", model: "Lesson" })
            .lean()
            .then((weeklyTable) => {
              res.render("site/courses/courseRegistration", {
                userData: req.userData,
                user: user,
                lesson: lesson,
                weeklyTable: weeklyTable,
                userId,
              });
            });
        });
    });
});

router.get("/course-registration/request", async (req, res) => {
  const user = await User.findOne({ _id: req.session.userId });
  const userId = user._id;
  User.find({})
    .lean()
    .then((user) => {
      Lesson.find({})
        .lean()
        .then((lesson) => {
          RequestPlannedTimetable.find({})
            .populate({ path: "teacherName", model: "User" })
            .populate({ path: "studentName", model: "User" })
            .populate({ path: "courseCode", model: "Lesson" })
            .lean()
            .then((courses) => {
              res.render("site/courses/requestCourseList", {
                userData: req.userData,
                user: user,
                lesson: lesson,
                courses: courses,
                userId,
              });
            });
        });
    });
});


router.post("/course-registration/request/:id",async(req,res)=>{
  const isPlannedCourse = req.body.plannedCourse;
  const weeklyTable = await WeeklyTable.findOne({
    week: req.body.week,
    year: req.body.year,
  });
  if (weeklyTable) {
    weeklyTable.courses.push({
      courseCode: req.body.courseCode,
      studentName: req.body.studentName,
      teacherName: req.params.id,
      courseHour: req.body.courseHour,
      courseMinute: req.body.courseMinute,
      courseEndHour: req.body.courseEndHour,
      courseEndMinute: req.body.courseEndMinute,
      courseDay: req.body.courseDay,
      courseType: req.body.courseType,
    });
    if (isPlannedCourse == "on") {
      RequestPlannedTimetable.create({ ...req.body });
    }
    weeklyTable.save();
    res.redirect("/");
  } else {
    WeeklyTable.create({
      week: req.body.week,
      year: req.body.year,
    }).then((weeklytable) => {
      weeklytable.courses.push({
        courseCode: req.body.courseCode,
        studentName: req.body.studentName,
        teacherName: req.params.id,
        courseHour: req.body.courseHour,
        courseMinute: req.body.courseMinute,
        courseEndHour: req.body.courseEndHour,
        courseEndMinute: req.body.courseEndMinute,
        courseDay: req.body.courseDay,
        courseType: req.body.courseType,
      });
      weeklytable.save();
    });
    if (isPlannedCourse == "on") {
      RequestPlannedTimetable.create({ ...req.body });
    }
    res.redirect("/");
  }
})

router.post("/course-registration/requestDesicion",(req,res)=>{
  if(req.body.action==="send"){
    RequestPlannedTimetable.find({_id:req.body.selected}).then(requestPlannedTimetable=>{
      requestPlannedTimetable.forEach(requestPlannedTimetable=>{
        PlannedTimetable.create({
          courseCode: requestPlannedTimetable.courseCode,
          teacherName: requestPlannedTimetable.teacherName,
          studentName: requestPlannedTimetable.studentName,
          courseType: requestPlannedTimetable.courseType,
          courseDay: requestPlannedTimetable.courseDay,
          courseHour: requestPlannedTimetable.courseHour,
          courseMinute: requestPlannedTimetable.courseMinute,
          courseEndHour: requestPlannedTimetable.courseEndHour,
          courseEndMinute: requestPlannedTimetable.courseEndMinute,
        })
      })
      RequestPlannedTimetable.deleteMany({ _id: { $in: req.body.selected } }).then(
        (requestPlannedTimetable) => {
          res.redirect("/course/course-registration/request");
        }
      );
    })
  }else if(req.body.action==="delete"){
    RequestPlannedTimetable.deleteMany({ _id: { $in: req.body.selected } }).then(
      (requestPlannedTimetable) => {
        res.redirect("/course/course-registration/request");
      }
    );
  }
})


router.post("/course-registration", async (req, res) => {
  const isPlannedCourse = req.body.plannedCourse;
  const weeklyTable = await WeeklyTable.findOne({
    week: req.body.week,
    year: req.body.year,
  });
  if (weeklyTable) {
    weeklyTable.courses.push({
      courseCode: req.body.courseCode,
      studentName: req.body.studentName,
      teacherName: req.body.teacherName,
      courseHour: req.body.courseHour,
      courseMinute: req.body.courseMinute,
      courseEndHour: req.body.courseEndHour,
      courseEndMinute: req.body.courseEndMinute,
      courseDay: req.body.courseDay,
      courseType: req.body.courseType,
    });
    if (isPlannedCourse == "on") {
      console.log("work2");
      PlannedTimetable.create({ ...req.body });
    }
    weeklyTable.save();
    res.redirect("/course/course-registration");
  } else {
    WeeklyTable.create({
      week: req.body.week,
      year: req.body.year,
    }).then((weeklytable) => {
      weeklytable.courses.push({
        courseCode: req.body.courseCode,
        studentName: req.body.studentName,
        teacherName: req.body.teacherName,
        courseHour: req.body.courseHour,
        courseMinute: req.body.courseMinute,
        courseEndHour: req.body.courseEndHour,
        courseEndMinute: req.body.courseEndMinute,
        courseDay: req.body.courseDay,
        courseType: req.body.courseType,
      });
      weeklytable.save();
    });
    if (isPlannedCourse == "on") {
      PlannedTimetable.create({ ...req.body });
    }
    res.redirect("/course/course-registration");
  }
});

module.exports = router;

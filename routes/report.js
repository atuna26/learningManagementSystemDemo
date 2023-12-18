const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Form = require("../models/Form")
const Lesson = require("../models/Lesson");
const WeeklyTable = require("../models/WeeklyTable");
const PlannedTimetable = require("../models/PlannedTimetable");
const RequestPlannedTimetable = require("../models/requestPlannedTimetable")
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


router.get("/form-reports", (req, res) => {
    Form.find({}).lean().then(form => {
        res.render("site/reports/formSelect", { form, userData: req.userData, })
    })
})
router.get("/form-reports/:id/", async (req, res) => {
    try {

        const actualForm = req.params.id
        let hourCalculate = 0

        const weeklyTable = await WeeklyTable.find({}).sort({ week: 1 }).lean();
        let startDate;
        let endDate;
        if (req.query.startDate && req.query.endDate) {
            startDate = new Date(req.query.startDate)
            endDate = new Date(req.query.endDate)
        } else {
            await WeeklyTable.findOne({ week: req.userData.currentWeek }).lean().then(week => {
                startDate = new Date(week.startDate)
                endDate = new Date(week.endDate)
            })
        }
        const formOld = await Form.find({
            actualForm: req.params.id,
        }).populate({ path: "questAndAnswer.1.answer", model: User }).populate({ path: "questAndAnswer.2.answer", model: User }).lean();


        const forms = formOld.filter((form => {
            const lessonDate = new Date(form.questAndAnswer[3].answer);
            return lessonDate >= startDate && lessonDate <= endDate;
        }))

        forms.forEach(forms => {
            if (
                forms.questAndAnswer[10].answer == "30 minutes" ||
                forms.questAndAnswer[10].answer == "45 minutes" ||
                forms.questAndAnswer[10].answer == "60 minutes" ||
                forms.questAndAnswer[9].answer ==
                " No the lesson is cancelled in the last 0-1h"
            ) {
                hourCalculate++
            }
            else if (
                forms.questAndAnswer[10].answer == "75 minutes" ||
                forms.questAndAnswer[10].answer == "90 minutes" ||
                forms.questAndAnswer[10].answer == "120 minutes"
            ) {
                hourCalculate += 2
            } else if (
                forms.questAndAnswer[10].answer == "150 minutes" ||
                forms.questAndAnswer[10].answer == "180 minutes"
            ) {
                hourCalculate += 3
            } else if (forms.questAndAnswer[10].answer == "4h") {
                hourCalculate += 4
            }
        })


        const totalAnswerCounts = {};
        forms.forEach(form => {
            if (form.questAndAnswer && typeof form.questAndAnswer === 'object') {
                Object.entries(form.questAndAnswer).forEach(([key, value]) => {
                    if (!totalAnswerCounts[key]) {
                        totalAnswerCounts[key] = [];
                    }

                    if (value.answer) {
                        const found = totalAnswerCounts[key].find(item => item.answer === value.answer);

                        if (found) {
                            found.count++;
                        } else {
                            totalAnswerCounts[key].push({
                                answer: value.answer,
                                question: value.question,
                                count: 1,
                            });
                        }
                    }
                });
            }
        });
        const formsLength = forms.length
        res.render("site/reports/formReport", { totalAnswerCounts, forms, weeklyTable, userData: req.userData, actualForm, formsLength, startDate, endDate, hourCalculate });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/teacher-reports", async (req, res) => {
    try {
        let startD = new Date("1.1.2023")
        let endD = new Date("1.1.2024")
        if (req.query.startDate && req.query.endDate) {
            startD = new Date(req.query.startDate)
            endD = new Date(req.query.endDate)
        }

        const teachers = await User.find({ role: "Teacher" }).lean();

        const reportData = await Promise.all(
            teachers.map(async (teacher) => {
                let formCount = 0
                let cancelledCount = 0
                let forms = await Form.find({ "questAndAnswer.1.answer": teacher._id }).lean()
                forms = forms.filter((form => {
                    const lessonDate = new Date(form.questAndAnswer[3].answer);
                    return lessonDate >= startD && lessonDate <= endD;
                }))
                forms.forEach(forms => {
                    if (
                        forms.questAndAnswer[10].answer == "30 minutes" ||
                        forms.questAndAnswer[10].answer == "45 minutes" ||
                        forms.questAndAnswer[10].answer == "60 minutes"

                    ) {
                        formCount++
                    }
                    else if (
                        forms.questAndAnswer[10].answer == "75 minutes" ||
                        forms.questAndAnswer[10].answer == "90 minutes" ||
                        forms.questAndAnswer[10].answer == "120 minutes"
                    ) {
                        formCount += 2
                    } else if (
                        forms.questAndAnswer[10].answer == "150 minutes" ||
                        forms.questAndAnswer[10].answer == "180 minutes"
                    ) {
                        formCount += 3
                    } else if (forms.questAndAnswer[10].answer == "4h") {
                        formCount += 4
                    }
                    if (forms.questAndAnswer[9].answer ==
                        "No, the lesson is cancelled in the last 0-1h") {
                        cancelledCount++
                    }
                })
                return {
                    teacherid: teacher._id,
                    teacherName: teacher.userName,
                    formCount,
                    cancelled: cancelledCount
                };
            })
        );

        res.render("site/reports/teacherReport", { reportData, userData: req.userData, startD, endD });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/teacher-reports/detail", async (req, res) => {
    try {
        let startD = new Date("1.1.2023");
        let endD = new Date("1.1.2024");
        if (req.query.startDate && req.query.endDate) {
            startD = new Date(req.query.startDate);
            endD = new Date(req.query.endDate);
        }

        const teacher = await User.findOne({ _id: req.query.id }).lean();
        let forms = await Form.find({ "questAndAnswer.1.answer": req.query._id }).populate({ path: "questAndAnswer.2.answer", model: User }).lean();
        let students = await User.find({ role: "Student" }).lean();

        forms = forms.filter((form) => {
            const lessonDate = new Date(form.questAndAnswer[3].answer);
            return lessonDate >= startD && lessonDate <= endD;
        });

        let studentReport = [];

        // forEach yerine map kullanıyoruz ve Promise dizisi oluşturuyoruz
        const promises = students.map(async (student) => {
            const studentid = student._id;
            const studentName = student.userName;
            // await kullanarak countDocuments'ı bekliyoruz
            let cancelledText = "No, the lesson is cancelled in the last 0-1h"
            let tenText ="No, the lesson is cancelled in the last 1-10h"
            let twentyFourText="No, the lesson is cancelled in the last 10-24h"
            const cancelledLesson = await Form.countDocuments({
                "questAndAnswer.1.answer": teacher._id,
                "questAndAnswer.2.answer": studentid,
                "questAndAnswer.9.answer": cancelledText
            });
            const tenLesson = await Form.countDocuments({
                "questAndAnswer.1.answer": teacher._id,
                "questAndAnswer.2.answer": studentid,
                "questAndAnswer.9.answer": tenText
            });
            const twentyFourLesson = await Form.countDocuments({
                "questAndAnswer.1.answer": teacher._id,
                "questAndAnswer.2.answer": studentid,
                "questAndAnswer.9.answer": twentyFourText
            });

            // Promise.resolve ile resolved bir Promise döndürüyoruz
            return Promise.resolve({ studentName, studentid, cancelledLesson,tenLesson,twentyFourLesson });
        });

        // Promise'ları bekliyoruz
        studentReport = await Promise.all(promises);
        res.render("site/reports/teacherReportDetail", { studentReport, userData: req.userData, startD, endD });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});



router.post("/teacher-reports/filter", (req, res) => {
    let startDate = req.body.startDate
    let endDate = req.body.endDate
    res.redirect(`/report/teacher-reports?startDate=${startDate}&endDate=${endDate}`)
})

router.get("/student-reports/", (req, res) => {
    WeeklyTable.find({}).sort({ week: 1 }).lean().then(weeklyTable => {
        res.render("site/reports/studentReportWeek", { userData: req.userData, weeklyTable })
    })
})

router.get("/student-reports/week", (req, res) => {
    let startD = req.query.startDate;
    let endD = req.query.endDate;
    User.find({ role: "Student" }).sort({ userName: 1 }).lean().then(user => {
        res.render("site/reports/studentReport", { user, userData: req.userData, startD, endD })
    })
})

router.get("/student-reports/view/week", async (req, res) => {
    const user = await User.findOne({ _id: req.query.student });
    const userName = user.userName;
    const userId = user._id;
    let { startDate, endDate } = req.query

    Form.find({
        actualForm: "6569a0a3be6ebd006513a277",
        "questAndAnswer.2.answer": userId,
    }).lean().sort({ "questAndAnswer.3.answer": 1 }).populate({ path: "questAndAnswer.1.answer", model: User }).then(form => {
        const startD = new Date(startDate);
        const endD = new Date(endDate);
        const formNew = form.filter((form) => {
            const lessonDate = new Date(form.questAndAnswer[3].answer);
            return lessonDate >= startD && lessonDate <= endD;
        })
        res.render("site/reports/studentWeeklySingle", { userName, endDate, startDate, formNew, layout: "" })
    })
})
router.post("/student-reports/student", (req, res) => {
    let startD = req.params.startDate;
    let endD = req.params.endDate;
    res.redirect(`/student-report/week?startDate=${startD}&endDate=${endD}`)
})

router.get("/student/weekly", (req, res) => {
    WeeklyTable.find({}).sort({ week: 1 }).lean().then(weeklyTable => {
        res.render("site/reports/studentWeekly", { weeklyTable, userData: req.userData })
    })
})

router.get("/student/weekly/week/", async (req, res) => {
    const user = await User.findOne({ _id: req.session.userId });
    const userName = user.userName;
    const userId = user._id;
    let { startDate, endDate } = req.query

    Form.find({
        actualForm: "6569a0a3be6ebd006513a277",
        "questAndAnswer.2.answer": userId,
    }).lean().sort({ "questAndAnswer.3.answer": 1 }).populate({ path: "questAndAnswer.1.answer", model: User }).then(form => {
        const startD = new Date(startDate);
        const endD = new Date(endDate);
        const formNew = form.filter((form) => {
            const lessonDate = new Date(form.questAndAnswer[3].answer);
            return lessonDate >= startD && lessonDate <= endD;
        })
        res.render("site/reports/studentWeeklySingle", { userName, endDate, startDate, formNew, layout: "" })
    })
})

module.exports = router;

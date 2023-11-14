const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Form = require("../models/Form")
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
  

router.get("/form-reports",(req,res)=>{
    Form.find({}).lean().then(form=>{
        res.render("site/reports/formSelect",{form,userData: req.userData,})
    })
})
router.get("/form-reports/:id/", async (req, res) => {
    try {

        const actualForm = req.params.id

        const weeklyTable = await WeeklyTable.find({}).sort({week:1}).lean();
        let startDate ;
        let endDate;
        if(req.query.startDate&&req.query.endDate){
            startDate = new Date(req.query.startDate)
            endDate = new Date(req.query.endDate)
        }else{
            console.log("yok")
            await WeeklyTable.findOne({week:req.userData.currentWeek}).lean().then(week=>{
                console.log(week.startDate)
                startDate = new Date(week.startDate)
                endDate = new Date(week.endDate)
            })
        }

        const forms = await Form.find({
            actualForm: req.params.id,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).lean();

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
                                count: 1
                            });
                        }
                    }
                });
            }
        });
        const formsLength = forms.length
        res.render("site/reports/formReport", { totalAnswerCounts,forms,weeklyTable,userData: req.userData,actualForm,formsLength });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


module.exports = router;

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Form = require("../models/Form");
const Lesson = require("../models/Lesson");
const mongoose = require("mongoose");
const openai = require("openai");
const Notification = require("../models/Notification");

const ai = new openai.OpenAI({
  apiKey: process.env.API_KEY,
});

async function LoadRoleInfo(req, res, next) {
  const user = await User.findOne({ _id: req.session.userId });
  if (user) {
    const userData = {
      userName: user.userName,
      role: user.role,
      currentWeek: "10",
    };
    req.userData = userData;
    req.user = user;
  }
  next();
}

router.use(LoadRoleInfo);

router.get("/available-form", async (req, res) => {
  Form.find({ formType: "Schema" })
    .lean()
    .then((form) => {
      res.render("site/forms/availableForm", {
        form: form,
        userData: req.userData,
      });
    });
});

router.get("/form-preview/:id", (req, res) => {
  Lesson.find({})
    .lean()
    .then((course) => {
      User.find({ role: "Teacher" })
        .lean()
        .then((teacher) => {
          User.find({ role: "Student" })
            .lean()
            .then((student) => {
              Form.findOne({ _id: req.params.id })
                .lean()
                .then((form) => {
                  res.render("site/forms/formPreview", {
                    form: form,
                    userData: req.userData,
                    teacher: teacher,
                    student: student,
                    course: course,
                  });
                });
            });
        });
    });
});

router.get("/sended-form", async (req, res) => {
  Form.find({ formType: "Answer", formUser: req.user._id })
    .sort({ date: -1 })
    .lean()
    .then((form) => {
      res.render("site/forms/sendedForm", {
        form: form,
        userData: req.userData,
      });
    });
});

router.get("/created-form", async (req, res) => {
  Form.find({ formType: "Schema" })
    .lean()
    .then((form) => {
      res.render("site/forms/createdForm", {
        form: form,
        userData: req.userData,
      });
    });
});

router.get("/incoming-form/:id", async (req, res) => {
  Form.find({ formType: "Answer", actualForm: req.params.id })
    .sort({ date: -1 })
    .populate({ path: "formUser", model: "User" })
    .lean()
    .then((form) => {
      res.render("site/forms/incomingForm", {
        form: form,
        userData: req.userData,
      });
    });
});

router.get("/form-detail/:id", (req, res) => {
  Lesson.find({})
    .lean()
    .then((course) => {
      User.find({ role: "Teacher" })
        .lean()
        .then((teacher) => {
          User.find({ role: "Student" })
            .lean()
            .then((student) => {
              Form.findOne({ _id: req.params.id })
                .lean()
                .then((form) => {
                  res.render("site/forms/formDetail", {
                    form: form,
                    userData: req.userData,
                    teacher: teacher,
                    student: student,
                    course: course,
                  });
                });
            });
        });
    });
});

router.post("/new", async (req, res) => {
  Form.create({
    ...req.body,
    formType: "Schema",
  }).then((form) => {
    form.questAndAnswer.forEach((qaa) => {
      if (qaa.answerList) {
        const answerListElements = qaa.answerList[0].split(","); // Virgüllere göre ayır
        qaa.answerList = answerListElements;
      }
    });
    form.save();
    res.redirect("/form/created-form");
  });
});

router.post("/answer/:id", async (req, res) => {
  Form.findOne({ _id: req.params.id }).then((form) => {
    Form.create({
      ...req.body,
      actualForm: form._id,
      formName: form.formName,
      formType: "Answer",
      formUser: req.user._id,
    }).then((newForm) => {
      if (form._id == "6569a0a3be6ebd006513a277") {
        let teacherId = String(newForm.questAndAnswer[1].answer);
        let studentId = String(newForm.questAndAnswer[2].answer);
        User.findOne({ _id: teacherId }).then((user) => {
          console.log(newForm.questAndAnswer[10].answer);
          if (
            newForm.questAndAnswer[10].answer == "30 minutes" ||
            newForm.questAndAnswer[10].answer == "45 minutes" ||
            newForm.questAndAnswer[10].answer == "60 minutes" ||
            newForm.questAndAnswer[9].answer ==
              " No the lesson is cancelled in the last 0-1h"
          ) {
            user.moneyToBePaid =
              Number(user.moneyToBePaid) + Number(user.feePerLesson);
            user.save();
          } else if (
            newForm.questAndAnswer[10].answer == "75 minutes" ||
            newForm.questAndAnswer[10].answer == "90 minutes" ||
            newForm.questAndAnswer[10].answer == "120 minutes"
          ) {
            user.moneyToBePaid =
              Number(user.moneyToBePaid) + Number(user.feePerLesson) * 2;
            user.save();
          } else if (
            newForm.questAndAnswer[10].answer == "150 minutes" ||
            newForm.questAndAnswer[10].answer == "180 minutes"
          ) {
            user.moneyToBePaid =
              Number(user.moneyToBePaid) + Number(user.feePerLesson) * 3;
            user.save();
          } else if (newForm.questAndAnswer[10].answer == "4h") {
            user.moneyToBePaid =
              Number(user.moneyToBePaid) + Number(user.feePerLesson) * 4;
            console.log("hi");
            user.save();
          } else {
            user.moneyToBePaid =
              Number(user.moneyToBePaid) + Number(user.feePerLesson);
            user.save();
          }
          User.findOne({ _id: studentId }).then((student) => {
            if (
              newForm.questAndAnswer[10].answer == "30 minutes" ||
              newForm.questAndAnswer[10].answer == "45 minutes" ||
              newForm.questAndAnswer[10].answer == "60 minutes" ||
              newForm.questAndAnswer[9].answer ==
                " No the lesson is cancelled in the last 0-1h"
            ) {
              student.moneyToBePaid =
                Number(student.moneyToBePaid) + Number(student.feePerLesson);
              student.save();
            } else if (
              newForm.questAndAnswer[10].answer == "75 minutes" ||
              newForm.questAndAnswer[10].answer == "90 minutes" ||
              newForm.questAndAnswer[10].answer == "120 minutes"
            ) {
              student.moneyToBePaid =
                Number(student.moneyToBePaid) +
                Number(student.feePerLesson) * 2;
              student.save();
            } else if (
              newForm.questAndAnswer[10].answer == "150 minutes" ||
              newForm.questAndAnswer[10].answer == "180 minutes"
            ) {
              student.moneyToBePaid =
                Number(student.moneyToBePaid) +
                Number(student.feePerLesson) * 3;
              console.log("hi");
              student.save();
            } else if (newForm.questAndAnswer[10].answer == "4h") {
              student.moneyToBePaid =
                Number(student.moneyToBePaid) +
                Number(student.feePerLesson) * 4;
              student.save();
            } else {
              student.moneyToBePaid =
                Number(student.moneyToBePaid) + Number(student.feePerLesson);
              student.save();
            }
            ai.chat.completions
              .create({
                model: "gpt-3.5-turbo",
                messages: [
                  {
                    role: "user",
                    content: `We have an education system. In this education system, after the teacher gives a lesson to the students, they evaluate the students with a form. The question is as follows: 'General Impressions: (Provide a brief summary of the topic and topic's overall understanding by the student.)'. I want you to correct grammatical and spelling mistakes, and also correct the sentence so that we can show it to their parents. The answer is as follows: ' ${newForm.questAndAnswer[15].answer} ' Please write only the corrected version. `,
                  },
                ],
              })
              .then((respond) => {
                newForm.questAndAnswer[15].chatgptAnswer =
                  respond.choices[0].message.content;
                newForm.questAndAnswer.forEach((formQuestion, index) => {
                  formQuestion.question = form.questAndAnswer[index].question;
                });
                newForm.save();
                res.redirect("/form/available-form");
              });
          });
        });
      }
    });
  });
});


router.get("/formedit", async (req, res) => {
  try {
    const forms = await Form.find({ formType: "Answer" }).lean();
    const users = await User.find({role:"Teacher"});
    let count = 0;
    for (const form of forms) {
      for (const user of users) {
        let formName = form.questAndAnswer[1].answer;

        // Eğer formName bir dize ise ve içinde user.userName geçiyorsa
        if (typeof formName === "string" && formName.includes(user.userName)) {
          count++
          console.log(count)
          const userId = new mongoose.Types.ObjectId(user._id);
          await Form.findByIdAndUpdate(
            form._id,
            { $set: { "questAndAnswer.1.answer":userId } }
          );
        }
      }
    }
    res.send("Formlar başarıyla güncellendi.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


module.exports = router;

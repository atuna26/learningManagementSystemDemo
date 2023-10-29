const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Form = require("../models/Form");
const Lesson = require("../models/Lesson");
const { model } = require("mongoose");
const openai = require("openai");

 const ai = new openai.OpenAI({
   apiKey: process.env.API_KEY,
 });

async function LoadRoleInfo(req, res, next) {
  const user = await User.findOne({ _id: req.session.userId });
  if (user) {
    const userData = {
      userName: user.userName,
      role: user.role,
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
    ai.chat.completions
        .create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "user", content: `We have an education system. In this education system, after the teacher gives a lesson to the students, they evaluate the students with a form. The question is as follows: 'General Impressions: (Provide a brief summary of the topic and topic's overall understanding by the student.)'. I want you to correct grammatical and spelling mistakes, and also correct the sentence so that we can show it to their parents. The answer is as follows: ' ${newForm.questAndAnswer[15].answer} ' Please write only the corrected version. `}],
        }).then(respond=>{
          newForm.questAndAnswer[15].chatgptAnswer = respond.choices[0].message.content
          newForm.questAndAnswer.forEach((formQuestion, index) => {
            formQuestion.question = form.questAndAnswer[index].question;
          });
        newForm.save();
        res.redirect("/form/available-form");
    });
  })
  });
});

module.exports = router;

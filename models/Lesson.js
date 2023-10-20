const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const LessonSchema = new mongoose.Schema({
    lessonCode: { type: String},
    lessonName: { type: String},
    lessonTeacher: [{type: Schema.Types.ObjectId, ref: "user"}],
    date: { type: Date, default: Date.now },

})

module.exports = mongoose.model("Lesson", LessonSchema)
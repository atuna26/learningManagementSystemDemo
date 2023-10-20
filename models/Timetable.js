const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const TimetableSchema = new mongoose.Schema({
    courseCode: [{type: Schema.Types.ObjectId, ref: "lesson"}],
    teacherName:{type: Schema.Types.ObjectId, ref: "user"},
    studentName:[{type: Schema.Types.ObjectId, ref: "user"}],
    courseDay:{type:String},
    courseHour:{type:String},
    courseMinute:{type:String},
    date: { type: Date, default: Date.now },

})

module.exports = mongoose.model("Timetable", TimetableSchema)
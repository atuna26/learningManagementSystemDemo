const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const RequestPlannedTimetableSchema = new mongoose.Schema({
    courseCode: {type: Schema.Types.ObjectId, ref: "lesson"},
    teacherName:[{type: Schema.Types.ObjectId, ref: "user"}],
    studentName:[{type: Schema.Types.ObjectId, ref: "user"}],
    courseType:{type:String},
    courseDay:{type:String},
    courseHour:{type:String},
    courseMinute:{type:String},
    courseEndHour:{type:String},
    courseEndMinute:{type:String},
    date: { type: Date, default: Date.now },

})

module.exports = mongoose.model("RequestPlannedTimetable", RequestPlannedTimetableSchema)
const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const TimetableSchema = new mongoose.Schema({
    courseCode: {type: Schema.Types.ObjectId, ref: "lesson"},
    teacherName:[{type: Schema.Types.ObjectId, ref: "user"}],
    studentName:[{type: Schema.Types.ObjectId, ref: "user"}],
    courseType:{type:String},
    courseDay:{type:String},
    courseHour:{type:String},
    courseMinute:{type:String},
    courseEndHour:{type:String},
    courseEndMinute:{type:String},
    isCourseCompleted:{type:String, default:"False"}

})

const WeeklyTableSchema = new mongoose.Schema({
    courses:[TimetableSchema],
    week:{type:Number},
    year:{type:Number},
})



module.exports = mongoose.model("WeeklyTable", WeeklyTableSchema)
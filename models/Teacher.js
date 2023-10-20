const mongoose = require("mongoose")

const TeacherSchema = new mongoose.Schema({
    profilePhoto:{type:String, default: "/assets/images/avatar/1.png"},
    teacherName: { type: String},
    teacherSurname: { type: String},
    mailAddress: { type: String},
    password: { type: String, min: 0, require:true},
    phoneNumber: { type: String},
    lesson:[{type:String}],
    moneyToBePaid:{type:String},
    moneyPaid:{type:String},
    date: { type: Date, default: Date.now },

})

module.exports = mongoose.model("Teacher", TeacherSchema)
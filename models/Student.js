const mongoose = require("mongoose")

const StudentSchema = new mongoose.Schema({
    profilePhoto:{type:String, default: "/assets/images/avatar/1.png"},
    studentName: { type: String},
    studentSurname: { type: String},
    mailAddress: { type: String},
    password: { type: String, min: 0, require:true},
    phoneNumber: { type: String},
    parentName:{type:String},
    parentPhoneNumber:{type:String},
    lesson:[{type:String}],
    moneyToBePaid:{type:String},
    moneyPaid:{type:String},
    grade: {type:String},
    date: { type: Date, default: Date.now },

})

module.exports = mongoose.model("Student", StudentSchema)
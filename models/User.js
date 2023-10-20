const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const UserSchema = new mongoose.Schema({
    userName: { type: String},
    userSurname: { type: String},
    mailAddress: { type: String, require:true, unique:true },
    password: { type: String, min: 0, require:true},
    phoneNumber: { type: String, require:true, unique:true},
    role:{type:String},
    lesson:[{type: Schema.Types.ObjectId, ref: "lesson"}],
    date: { type: Date, default: Date.now },
    grade: {type:String},
    parentName:{type:String},
    parentPhoneNumber:{type:String},
    moneyToBePaid:{type:String},
    moneyPaid:{type:String},
    profilePhoto:{type:String, default: "/assets/images/avatar/1.png"},

})

module.exports = mongoose.model("User", UserSchema)
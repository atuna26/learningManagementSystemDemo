const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const qaaSchema = new mongoose.Schema({
    questionKind:{type:String},
    isRequired:{type:String},
    question: { type: String},
    answer: { type: String},
    chatgptAnswer:{type:String},
    answerList: [{ type: String}],
    order:{type:Number}
})

const FormSchema = new mongoose.Schema({
    formName: { type: String},
    formFor:{type:String},
    formKind:{type:String},
    questAndAnswer:[qaaSchema],
    formType:{type:String},
    confirmation:{type:Boolean, default:false},
    formStatus:{type:String},
    formUser:{type: Schema.Types.ObjectId, ref: "user"},
    actualForm:{type: Schema.Types.ObjectId, ref: "form"},
    date: { type: Date, default: Date.now },

})

module.exports = mongoose.model("Form", FormSchema)
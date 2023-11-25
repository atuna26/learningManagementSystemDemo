const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const NotificationSchema = new mongoose.Schema({
    title: { type: String},
    symbol:  { type: String},
    color:{type:String},
    gettingUser:[{type: Schema.Types.ObjectId, ref: "user"}],
    date: { type: Date, default: Date.now },

})

module.exports = mongoose.model("Notification", NotificationSchema)
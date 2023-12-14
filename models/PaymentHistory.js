const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const PaymentHistorySchema = new mongoose.Schema({
    type:{type:String},
    amount:{type:String},
    user:[{type:Schema.Types.ObjectId, ref:"user"}],
    date:{type:Date, default: Date.now},
})

module.exports = mongoose.model("PaymentHistory",PaymentHistorySchema)
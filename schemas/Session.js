const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Rate = require("./Rate");

const SessionSchema = new Schema({
    student: {
        type: Number,
        required: true,
    },
    in_time: {
        type: Date,
        required: true,
        default: Date.now,
        unique: true,
    },
    out_time: {
        type: Date,
        required: false,
    },
    rate: {
        type: Rate.schema,
        required: false,
    },
    paid: {
        type: Boolean,
        required: true,
        default: false,
    },
});

module.exports = Session = mongoose.model("session", SessionSchema);
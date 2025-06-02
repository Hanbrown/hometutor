const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RateSchema = new Schema({
    cost: {
        type: Number,
        required: true,
        default: 60.00
    },
    date_updated: {
        type: Date,
        required: true,
        default: Date.now,
    }
});

module.exports = Rate = mongoose.model("rate", RateSchema);
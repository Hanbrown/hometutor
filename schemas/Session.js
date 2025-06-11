import { model, Schema } from "mongoose";

const SessionSchema = new Schema({
    number: {
        type: Number,
        required: true,
        unique: true,
        default: 999,
    },
    student: {
        type: Number,
        required: true,
    },
    in_time: {
        type: Date,
        required: false,
    },
    out_time: {
        type: Date,
        required: true,
        default: Date.now,
        unique: true,
    },
    rate: {
        type: Number,
        required: false,
    },
    paid: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const Session = model("session", SessionSchema);
export default Session;
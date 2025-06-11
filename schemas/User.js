import { model, Schema } from "mongoose";

const UserSchema = new Schema({
    rate: {
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

const User = model("user", UserSchema);
export default User;
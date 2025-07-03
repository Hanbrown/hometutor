import { model, Schema } from "mongoose";

const UserSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    rate: {
        type: Number,
        required: false,
        default: 60.00
    }
});

const User = model("user", UserSchema);
export default User;
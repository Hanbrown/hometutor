import { model, Schema } from "mongoose";

const StudentSchema = new Schema({
    id_short: {
        type: Number,
        required: true,
        default: Math.floor(Math.random())*10000,
        unique: true,
    },
    fname: {
		type: String,
		required: true,
		default: "Joost",
	},
	lname: {
        type: String,
        required: true,
        default: "Doe",
    },
    active: {
        type: Boolean,
        required: true,
        default: true,
    },
    rate: {
        type: Number,
        required: true,
        default: 60
    },
    user: {
        type: Number,
        required: true
    }
});

const Student = model("student", StudentSchema);
export default Student;
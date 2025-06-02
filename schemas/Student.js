const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
    id: {
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
    }
});

module.exports = Student = mongoose.model("student", StudentSchema);
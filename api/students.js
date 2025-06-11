/**
 * Router (accessed in server.js -- kept here for tidiness)
 * NOTE: To get over here, type "/api/students/[route]"
 **/

import express from "express";
const router = express.Router();

import Student from "../schemas/Student.js";
import User from "../schemas/User.js";

router.get("/read/:id", (req, res) => {
    console.log(req.params.id);
    res.json({error: false, msg: "Read a student"});
});

router.get("/read", async (req, res) => {
    try {
        const data = Student.find().sort({ lname: -1 });
        res.json({error: false, msg: "Read all students", data: data});
    }
    catch {
        console.log("Error getting all students");
        res.json({error: true, msg: "Error!"});
    }
});

router.post("/add", async (req, res) => {
    try {
        const { fname, lname, active } = req.body;

        let id_short = Math.floor(Math.random() * 1000);

        const newStudent = Student({
            id_short,
            fname,
            lname,
            active,
        });

        const response = await newStudent.save();

        res.json({
            error: false, 
            msg: "Added a student", 
            data: {
                id_short: response.id_short,
                fname: response.fname,
                lname: response.lname,
                active: response.active
            }
        });
    }
    catch {
        console.log("Adding a student failed");
        res.json({error: true, msg: "Error!"});
    }
});

router.post("/update", (req, res) => {
    console.log("Updated a student");
    res.json({error: false, msg: "Updated a student"});
});

router.delete("/:id", (req, res) => {
    console.log(req.params.id);
    res.json({error: false, msg: "Deleted a student"});
});

export default router;
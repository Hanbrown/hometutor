/**
 * Router (accessed in server.js -- kept here for tidiness)
 * NOTE: To get over here, type "/api/students/[route]"
 **/

import express from "express";
const router = express.Router();

import Student from "../schemas/Student.js";
import User from "../schemas/User.js";

router.get("/read/:id", async (req, res) => {
    try {
        const data = await Student.where({ id_short: req.params.id }).findOne();
        res.json({
            error: false, 
            msg: "Read one student", 
            data: {
                id_short: data.id_short,
                fname: data.fname,
                lname: data.lname,
                active: data.active,
            }
        });
    }
    catch (err) {
        console.log("Error getting all students");
        res.json({error: true, msg: "Error!"});
    }
});

router.get("/read", async (req, res) => {
    try {
        const data = await Student.find().sort({ lname: -1 });
        const data_res = data.map(datum => {
            return {
                id_short: datum.id_short,
                fname: datum.fname,
                lname: datum.lname,
                active: datum.active,
            }
        });
        res.json({ error: false, msg: "Read all students", data: data_res});
    }
    catch (err) {
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
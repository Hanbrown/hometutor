/**
 * Router (accessed in server.js -- kept here for tidiness)
 * NOTE: To get over here, type "/api/sessions/[route]"
 **/

import express from "express";
const router = express.Router();

import Session from "../schemas/Session.js";
import Student from "../schemas/Student.js";
import User from "../schemas/User.js";

router.get("/read/:student/:id", async (req, res) => {
    try {
        // Does this find the first match, or does it throw an error if there are more than one match?
        const data = await Session.where({ number: req.params.id, student: req.params.student }).findOne();
        res.json({
            error: false, 
            msg: "Read one session", 
            data: {
                number: data.number,
                student: data.student,
                in_time: data.in_time,
                out_time: data.out_time,
                rate: data.rate,
                paid: data.paid,
            }
        });
    }
    catch (err) {
        console.log("Error getting one session");
        res.json({error: true, msg: "Error!"});
    }
});

router.get("/read/:student", async (req, res) => {
    try {
        const data = await Session.where({ student: req.params.student }).find().sort({ number: -1 });
        const data_res = data.map(datum => {
            return {
                number: datum.number,
                student: datum.student,
                in_time: datum.in_time,
                out_time: datum.out_time,
                rate: datum.rate,
                paid: datum.paid,
            }
        });
        res.json({ error: false, msg: "Read all sessions", data: data_res});
    }
    catch (err) {
        console.log("Error getting all sessions");
        res.json({error: true, msg: "Error!"});
    }
});

router.post("/add", async (req, res) => {
    try {
        const { student, in_time, out_time, rate, paid } = req.body;

        let number;
        const latestRecord = await Session.where({ student: Number(student) }).find().sort({ number: -1 }).limit(1);
        if (latestRecord.length === 1) {
            console.log(latestRecord[0]);
            number = latestRecord[0].number + 1;
        }
        else {
            number = 1;
        }

        const newSession = Session({
            number,
            student,
            in_time,
            out_time,
            rate,
            paid,
        });

        const response = await newSession.save();

        res.json({
            error: false, 
            msg: "Added a session", 
            data: {
                number: response.number,
                student: response.student,
                in_time: response.in_time,
                out_time: response.out_time,
                rate: response.rate,
                paid: response.paid,
            }
        });
    }
    catch(err) {
        console.error(err);
        console.log("Adding a session failed");
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
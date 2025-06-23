/**
 * Router (accessed in server.js -- kept here for tidiness)
 * NOTE: To get over here, type "/api/students/[route]"
 **/

import express from "express";
const router = express.Router();
import logger from '../logger.js';

import Student from "../schemas/Student.js";
import Session from "../schemas/Session.js";

const auth = (req, res, next) => {
    if (process.env.NODE_ENV === "production") {
        if (req.isAuthenticated()) {
            logger.info("Logged in");
            next();
        }
        else {
            logger.warn("Forbidden");
            res.status(403).json({error: true, msg: "session not valid"});
        }
    }
    else {
        next();
    }
}

router.get("/read/:id", auth, async (req, res) => {
    try {
        logger.info("Reading a student");
        let data;
        if (process.env.NODE_ENV === "production") {
            data = await Student.where({ id_short: req.params.id, user: req.user.id }).findOne();
        }
        else {
            data = await Student.where({ id_short: req.params.id }).findOne();
        }
        res.json({
            error: false, 
            msg: "Read one student", 
            data: {
                id_short: data.id_short,
                fname: data.fname,
                lname: data.lname,
                active: data.active,
                rate: data.rate,
            }
        });
    }
    catch (err) {
        logger.error("Error getting one student");
        logger.error(err);
        res.json({error: true, msg: "Error!"});
    }
});

router.get("/read", auth, async (req, res) => {
    try {
        logger.info("Reading all students");
        let data;
        if (process.env.NODE_ENV === "production") {
            data = await Student.where({ user: req.user.id }).find().sort({ lname: 1 });
        }
        else {
            data = await Student.find().sort({ lname: 1 });
        }
        const data_res = data.map(datum => {
            return {
                id_short: datum.id_short,
                fname: datum.fname,
                lname: datum.lname,
                active: datum.active,
                rate: datum.rate,
            }
        });
        res.json({ error: false, msg: "Read all students", data: data_res});
    }
    catch {
        logger.error(`Error in /read: ${req.originalUrl}`);
        res.json({error: true, msg: "Error!"});
    }
});

router.post("/add", auth, async (req, res) => {
    try {
        const { fname, lname, active, rate } = req.body;
        const user = req.user.id;

        logger.debug(JSON.stringify(req.body));

        let id_short = Math.floor(Math.random() * 1000);

        const newStudent = Student({
            id_short,
            fname,
            lname,
            active,
            rate,
            user
        });

        const response = await newStudent.save();

        logger.info("Added a student");
        res.json({
            error: false, 
            msg: "Added a student", 
            data: {
                id_short: response.id_short,
                fname: response.fname,
                lname: response.lname,
                active: response.active,
                rate: response.rate
            }
        });
    }
    catch {
        logger.error(`Error in students/add: ${JSON.stringify(req.body)}`);
        res.json({error: true, msg: "Error!"});
    }
});

router.post("/update", auth, async (req, res) => {
    try {
        let updated = req.body;
        logger.debug(JSON.stringify(updated));
        updated["user"] = req.user.id;
        const doc = await Student.where({ id_short: updated.id_short, user: updated.user }).findOne();
        if (doc === null) {
            throw new Error("No student found");
        }
        const response = await doc.overwrite(updated).save();
        logger.debug(response);
        logger.info("Updated a student");
        res.json({error: false, msg: "Updated a student"});
    }
    catch {
        logger.error(`Error in students/update: ${req.body}`);
        res.json({error: true, msg: "Couldn't update the student"});
    }
});

/**
 * Delete this student and all their classes. DANGEROUS!!
 */
router.delete("/delete", auth, async (req, res) => {
    try {
        const { id } = req.body;
        let response = await Student.where({ id_short: id, user: req.user.id }).findOneAndDelete();
        if (response === null) {
            throw new Error("Document not found");
        }
        response = await Session.deleteMany({ student: id, user: req.user.id });
        if (response === null) {
            throw new Error("Document not found");
        }
        logger.info("Deleted a student and their classes");
        res.json({error: false, msg: "Deleted a student and their classes"});
    }
    catch (err) {
        logger.error(`Error in students/read: ${req.params}`);
        logger.error(err);
        res.json({error: true, msg: "Couldn't delete"});
    }
});

export default router;
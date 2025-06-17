/**
 * Router (accessed in server.js -- kept here for tidiness)
 * NOTE: To get over here, type "/api/sessions/[route]"
 **/

import express from "express";
const router = express.Router();
import logger from '../logger.js';

import Session from "../schemas/Session.js";
import Student from "../schemas/Student.js";
import User from "../schemas/User.js";
import path from "node:path";
const __dirname = path.resolve(path.dirname(''));

import { export_pdf } from "../pdf/pdf_export.js";

router.get("/read/:student/:id", async (req, res) => {
    try {
        logger.info("Reading one session for a student");
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
        logger.error("Error getting one session");
        res.json({error: true, msg: "Error!"});
    }
});

router.get("/read/:student", async (req, res) => {
    try {
        logger.info("Reading all sessions for a student");
        const data = await Session.where({ student: req.params.student }).find().sort({ number: -1 });
        const data_res = data.map(datum => {
            return {
                number: datum.number,
                student: datum.student,
                in_time: datum.in_time,
                out_time: datum.out_time,
                rate: datum.rate,
                paid: datum.paid,
                selected: false,
            }
        });
        res.json({ error: false, msg: "Read all sessions", data: data_res});
    }
    catch (err) {
        logger.error("Error getting all sessions");
        res.json({error: true, msg: "Error!"});
    }
});

router.post("/add", async (req, res) => {
    try {
        logger.info("Adding a session");
        const { student, in_time, out_time, rate, paid } = req.body;

        let number;
        const latestRecord = await Session.where({ student: Number(student) }).find().sort({ number: -1 }).limit(1);
        if (latestRecord.length === 1) {
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
        logger.error(err);
        logger.error("Adding a session failed");
        res.json({error: true, msg: "Error!"});
    }
});

router.post("/update", async (req, res) => {
    try {
        logger.info("Updating a session");
        const updated = req.body;
        const doc = await Session.where({ student: updated.student, number: updated.number }).findOne()
        const response = await doc.overwrite(updated).save();
        logger.debug(response);
        res.json({error: false, msg: "Updated a session"});
    }
    catch (err) {
        logger.error(err);
        logger.error("Error updating a session entry");
        res.json({err: true, msg: "Couldn't update the session"});
    }
});

router.post("/delete", async (req, res) => {
    try {
        logger.info("Deleting a session");
        const { number, student } = req.body;
        logger.debug(JSON.stringify(req.body));
        const response = await Session.where({ number: number, student: student }).findOneAndDelete()
        if (response === null) {
            throw new Error("Document not found");
        }
        res.json({error: false, msg: "Deleted a session"});
    }
    catch (err) {
        logger.error(err);
        logger.error("Error deleting a session");
        res.json({error: true, msg: "Couldn't delete the session"});
    }
});

router.post("/invoice", async (req, res) => {
    const { student, sessions } = req.body;
    if (sessions.length < 1) {
        res.status(400).json({error: true, msg: "No sessions selected for invoice"});
        return;
    }

    try {
        logger.info("Creating Invoice");
        await export_pdf(student, sessions);
        res.download(path.resolve(__dirname, "pdf", "invoice.pdf"));
    }
    catch (err) {
        logger.error(err);
        logger.info(JSON.stringify(req.body));
        logger.error("Error creating an invoice");
        res.status(400).json({error: true, msg: "Error processing request"});
    }
});

export default router;
/**
 * Router (accessed in server.js -- kept here for tidiness)
 * NOTE: To get over here, type "/api/sessions/[route]"
 **/

import express from "express";
const router = express.Router();
import logger from '../logger.js';

import Session from "../schemas/Session.js";
import path from "node:path";
const __dirname = path.resolve(path.dirname(''));

import { export_pdf } from "../pdf/pdf_export.js";

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

router.get("/read/:student/:id", auth, async (req, res) => {
    try {
        logger.info("Reading one session for a student");
        // Does this find the first match, or does it throw an error if there are more than one match?
        const data = await Session.where({ number: req.params.id, student: req.params.student, user: req.user.id }).find();
        if (data.length > 1) {
            throw new Error("More than one document found");
        }
        res.json({
            error: false, 
            msg: "Read one session", 
            data: {
                number: data[0].number,
                student: data[0].student,
                in_time: data[0].in_time,
                out_time: data[0].out_time,
                rate: data[0].rate,
                paid: data[0].paid,
            }
        });
    }
    catch(err) {
        logger.error(err);
        logger.error("Error getting one session");
        res.json({error: true, msg: "Error!"});
    }
});

router.get("/read/:student", auth, async (req, res) => {
    try {
        logger.info("Reading all sessions for a student");
        const data = await Session.where({ student: req.params.student, user: req.user.id }).find().sort({ number: -1 });
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
    catch {
        logger.error("Error getting all sessions");
        res.json({error: true, msg: "Error!"});
    }
});

router.post("/add", auth, async (req, res) => {
    try {
        logger.info("Adding a session");
        const { student, in_time, out_time, rate, paid } = req.body;
        const user = req.user.id;

        let number;
        const latestRecord = await Session.where({ student: Number(student), user: req.user.id }).find().sort({ number: -1 }).limit(1);
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
            user,
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

router.post("/update", auth, async (req, res) => {
    try {
        logger.info("Updating a session");
        let updated = req.body;
        updated["user"] = req.user.id;
        const doc = await Session.where({ number: updated.number, student: updated.student, user: updated.user }).findOne()
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

router.post("/delete", auth, async (req, res) => {
    try {
        logger.info("Deleting a session");
        const { number, student } = req.body;
        logger.debug(JSON.stringify(req.body));
        const response = await Session.where({ number: number, student: student, user: req.user.id }).findOneAndDelete()
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

router.post("/invoice", auth, async (req, res) => {
    const { student, sessions } = req.body;
    if (sessions.length < 1) {
        logger.debug("Not enough sessions");
        res.status(400).json({error: true, msg: "Please select up to 8 sessions"});
        return;
    }
    else if (sessions.length > 8) {
        logger.debug("Too many sessions");
        res.status(400).json({error: true, msg: "Please select up to 8 sessions"});
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
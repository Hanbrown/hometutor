/**
 * Router (accessed in server.js -- kept here for tidiness)
 * NOTE: To get over here, type "/api/sessions/[route]"
 **/

import express from "express";
const router = express.Router();
import logger from '../logger.js';

import dotenv from "dotenv" // For .env file
dotenv.config();

import path from "node:path";
const __dirname = path.resolve(path.dirname(''));

import { export_pdf } from "../pdf/pdf_export.js";
import { Pool } from "pg";
import { time } from "node:console";

const pgPool = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASS,
    database: process.env.PG_DB
});

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
        const { rows } = await pgPool.query(
            "SELECT * FROM sessions WHERE id=$1 AND student=$2 AND gid=$3;",
            [req.params.id, req.params.student, req.user.id]
        );
        if (rows.length !== 1) {
            throw new Error(`Other than one session found for id ${req.params.id}`);
        }
        res.json({
            error: false, 
            msg: "Read one session", 
            data: {
                number: rows[0].id,
                student: rows[0].student,
                in_time: rows[0].in_time,
                out_time: rows[0].out_time,
                rate: rows[0].rate,
                paid: rows[0].paid,
            }
        });
    }
    catch(err) {
        logger.error(err.stack);
        logger.error("Error getting one session");
        res.json({error: true, msg: "Error!"});
    }
});

router.get("/read/:student", auth, async (req, res) => {
    try {
        logger.info("Reading all sessions for a student");

        const { rows } = await pgPool.query(
            "SELECT * FROM sessions WHERE student=$1 AND gid=$2",
            [req.params.student, req.user.id]
        );

        let data = rows.map(datum => {
            return {
                number: datum.id,
                student: datum.student,
                in_time: datum.in_time,
                out_time: datum.out_time,
                rate: datum.rate,
                paid: datum.paid,
                selected: false,
            }
        });
        data.sort((a, b) => a.out_time > b.out_time);

        res.json({ error: false, msg: "Read all sessions", data: data});
    }
    catch(err) {
        logger.error("Error getting all sessions");
        logger.error(err.stack);
        res.json({error: true, msg: "Error!"});
    }
});

router.post("/add", auth, async (req, res) => {
    try {
        logger.info("Adding a session");
        const { student, in_time, out_time, rate, paid } = req.body;

        // Validation
        if ( student === undefined || in_time === undefined || out_time === undefined || rate === undefined || paid === undefined ) {
            logger.error("Error adding a session");
            logger.error(JSON.stringify(req.body));
            res.json({error: true, msg: "Invalid input"});
        }

        let in_time_obj = new Date(in_time);
        let out_time_obj = new Date(out_time);

        logger.debug(JSON.stringify(req.body));
        const { rows } = await pgPool.query(
            "INSERT INTO sessions (student, in_time, out_time, rate, paid, gid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;",
            [Number(student), in_time_obj, out_time_obj, Number(rate), paid, req.user.id]
        );

        if (rows.length !== 1) {
            throw new Error("Error adding record");
        }

        res.json({
            error: false, 
            msg: "Added a session", 
            data: {
                number: rows[0].id,
                student: rows[0].student,
                in_time: rows[0].in_time,
                out_time: rows[0].out_time,
                rate: rows[0].rate,
                paid: rows[0].paid,
            }
        });
    }
    catch(err) {
        logger.debug(JSON.stringify(req.body));
        logger.error(err.stack);
        logger.error("Adding a session failed");
        res.json({error: true, msg: "Error!"});
    }
});

router.post("/update", auth, async (req, res) => {
    try {
        logger.info("Updating a session");
        const { number, student, in_time, out_time, rate, paid } = req.body;

        logger.debug(JSON.stringify(req.body));
        await pgPool.query(
            "UPDATE sessions SET in_time=$1, out_time=$2, rate=$3, paid=$4 WHERE id=$5 AND student=$6 AND gid=$7 RETURNING *;",
            [new Date(in_time), new Date(out_time), Number(rate), paid, Number(number), Number(student), req.user.id]
        );

        res.json({error: false, msg: "Updated a session"});
    }
    catch (err) {
        logger.error(err.stack);
        logger.error("Error updating a session entry");
        res.json({err: true, msg: "Couldn't update the session"});
    }
});

router.post("/delete", auth, async (req, res) => {
    try {
        logger.info("Deleting a session");
        const { number, student } = req.body;
        logger.debug(JSON.stringify(req.body));
        if ( number === undefined || student === undefined ) {
            throw new Error(`Deleting failed with number ${number} for student ${student}`);
        }

        await pgPool.query(
            "DELETE FROM sessions WHERE id=$1 AND student=$2 AND gid=$3 RETURNING *",
            [number, student, req.user.id]
        );

        res.json({error: false, msg: "Deleted a session"});
    }
    catch (err) {
        logger.error(err.stack);
        logger.error("Error deleting a session");
        res.json({error: true, msg: "Couldn't delete the session"});
    }
});

router.post("/invoice", auth, async (req, res) => {
    const { student, sessions, timezone } = req.body;

    logger.debug(JSON.stringify(req.body));
    if (student === undefined || sessions === undefined || timezone === undefined ) {
        throw new Error(`Generating invoice for student ${student} out of sessions ${JSON.stringify(sessions)} failed`);
    }

    if (timezone.length === 0) {
        logger.debug("No timezone selected");
        res.status(400).json({error: true, msg: "Please select a timezone for the invoice"});
        return;
    }

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
        let combined = [];
        sessions.map((sesh) => {
            combined.push(Number(sesh));
        });

        logger.debug(combined);

        const { rows } = await pgPool.query(
            "SELECT * FROM sessions WHERE id=ANY ($1) AND student=$2 AND gid=$3;",
            [combined, student, req.user.id]
        );
        await export_pdf(res, student, rows, timezone);
        res.status(200);
    }
    catch (err) {
        logger.error(err.stack);
        logger.info(JSON.stringify(req.body));
        logger.error("Error creating an invoice");
        res.status(400).json({error: true, msg: "Error processing request"});
    }
});

export default router;
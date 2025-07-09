/**
 * Router (accessed in server.js -- kept here for tidiness)
 * NOTE: To get over here, type "/api/students/[route]"
 **/

import express from "express";
const router = express.Router();
import logger from '../logger.js';

import dotenv from "dotenv" // For .env file
dotenv.config();

import { Pool } from "pg";

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

router.get("/read/:id", auth, async (req, res) => {
    try {
        logger.info("Reading a student");
        let data;
        if (process.env.NODE_ENV === "production") {
            const response = await pgPool.query("SELECT * FROM students WHERE id=$1 AND gid=$2", [req.params.id, req.user.id]);
            if (response.rows.length !== 1) {
                throw new Error(`Duplicate DB entry found for ${req.params.id}`);
            }
            else {
                data = response.rows[0];
            }
        }
        else {
            const response = await pgPool.query("SELECT * FROM students WHERE id=$1", [req.params.id]);
            if (response.rows.length !== 1) {
                throw new Error(`Duplicate DB entry found for ${req.params.id}`);
            }
            else {
                data = response.rows[0];
            }
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
        logger.error(err.stack);
        res.json({error: true, msg: "Error!"});
    }
});

router.get("/read", auth, async (req, res) => {
    try {
        logger.info("Reading all students");
        let data;
        if (process.env.NODE_ENV === "production") {
            const { rows } = await pgPool.query("SELECT * FROM students WHERE gid=$1", [req.user.id]);
            data = rows.sort((a, b) => a.fname < b.fname);
        }
        else {
            const { rows } = await pgPool.query("SELECT * FROM students");
            data = rows.sort((a, b) => a.fname < b.fname);
        }
        const data_res = data.map(datum => {
            return {
                id_short: Number(datum.id),
                fname: datum.fname,
                lname: datum.lname,
                active: datum.active,
                rate: datum.rate,
            }
        });
        res.json({ error: false, msg: "Read all students", data: data_res});
    }
    catch(err) {
        logger.error(`Error in /read: ${req.originalUrl}`);
        logger.error(err.stack);
        res.json({error: true, msg: "Error!"});
    }
});

router.post("/add", auth, async (req, res) => {
    try {
        const { fname, lname, active, rate } = req.body;

        if (fname === undefined || lname === undefined || active === undefined || rate === undefined) {
            throw new Error("Invalid input");
        }

        logger.debug(JSON.stringify(req.body));

        const { rows } = await pgPool.query(
            "INSERT INTO students (fname, lname, active, rate, gid) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
            [fname, lname, active, rate, req.user.id]
        );

        logger.debug(JSON.stringify(rows));
        if (rows.length !== 1) {
            throw new Error("Duplicate entry found");
        }
        else {
            logger.info("Added a student");
            res.json({
                error: false, 
                msg: "Added a student", 
                data: {
                    id_short: rows[0].id,
                    fname: rows[0].fname,
                    lname: rows[0].lname,
                    active: rows[0].active,
                    rate: rows[0].rate
                }
            });
        }        
    }
    catch(err) {
        logger.error(`Error in students/add: ${JSON.stringify(req.body)}`);
        logger.error(err.stack);
        res.json({error: true, msg: "Error!"});
    }
});

// Ensure only prewritten properties are overwritten, no new properties should be written
router.post("/update", auth, async (req, res) => {
    try {
        if (req.body === undefined) {
            throw new Error("Invalid input");
        }

        const { id_short, fname, lname, active, rate } = req.body;

        await pgPool.query(
            "UPDATE students SET fname=$1, lname=$2, active=$3, rate=$4 WHERE id=$5 AND gid=$6;",
            [fname, lname, active, Number(rate), Number(id_short), req.user.id]
        );

        logger.info("Updated a student");
        res.json({error: false, msg: "Updated a student"});
    }
    catch(err) {
        logger.error(`Error in students/update: ${JSON.stringify(req.body)}`);
        logger.error(err.stack);
        res.json({error: true, msg: "Couldn't update the student"});
    }
});

/**
 * Delete this student and all their classes. DANGEROUS!!
 */
router.delete("/delete", auth, async (req, res) => {
    try {
        const { id } = req.body;
        if (id === undefined) {
            logger.error(`${id} not provided in request`);
            throw new Error("Input error");
        }

        // Because of DB Rules, sessions will be deleted as well
        await pgPool.query(
            "DELETE FROM students WHERE id=$1 AND gid=$2",
            [id, req.user.id]
        );

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
/**
 * Router (accessed in server.js -- kept here for tidiness)
 * NOTE: To get over here, type "/api/users/[route]"
 **/

import express from "express";
const router = express.Router();
import logger from '../logger.js';

import dotenv from "dotenv" // For .env file
dotenv.config();

import { Pool } from "pg";

let pgPool;
pgPool = new Pool({
    connectionString: process.env.PG_URI,
    ssl: {
        rejectUnauthorized: false
    }
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

router.post("/update", auth, async (req, res) => {
    try {
        logger.debug(JSON.stringify(req.body));
        const { rate } = req.body;

        if (rate === undefined) {
            throw new Error("Invalid input");
        }

        await pgPool.query(
            "UPDATE users SET rate = $1 WHERE id=$2;",
            [Number(rate), req.user.id]
        );
        logger.info("Updated a user");

        res.cookie("rate", rate);
        res.json({error: false, msg: "Updated a user"});
        return;
    }
    catch (err) {
        logger.error(err.stack);
        logger.error("Error while updating a user");
        res.status(404).json({error: true, msg: "Couldn't update the rate"});
        return;
    }
});

export default router;
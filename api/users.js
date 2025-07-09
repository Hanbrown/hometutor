/**
 * Router (accessed in server.js -- kept here for tidiness)
 * NOTE: To get over here, type "/api/items/[route]"
 **/

import express from "express";
const router = express.Router();
import logger from '../logger.js';

import dotenv from "dotenv" // For .env file
dotenv.config();

import User from "../schemas/User.js";
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

router.post("/update", auth, async (req, res) => {
    try {
        logger.debug(JSON.stringify(req.body));
        const { rate } = req.body;

        if (rate === undefined) {
            throw new Error("Invalid input");
        }

        const user_id = req.user.id;
        const docs = await User.where({ id: user_id }).find();
        logger.debug(user_id);
        if (docs.length !== 1) {
            throw new Error("Internal server error");
        }
        else {
            let user = docs[0];
            user.rate = rate;

            const query = "UPDATE users SET rate = $1 RETURNING *;";
            const pg_response = await pgPool.query(query, [rate]);

            const response = await docs[0].overwrite(user).save();

            logger.debug(pg_response.rows);
            logger.debug(response);
            logger.info("Updated a user");

            res.cookie("rate", rate);
            res.json({error: false, msg: "Updated a user"});
            return;
        }
    }
    catch (err) {
        logger.error(err);
        logger.error("Error while updating a user");
        res.status(404).json({error: true, msg: "Couldn't update the rate"});
        return;
    }
});

export default router;
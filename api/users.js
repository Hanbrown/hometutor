/**
 * Router (accessed in server.js -- kept here for tidiness)
 * NOTE: To get over here, type "/api/items/[route]"
 **/

import express, { json } from "express";
const router = express.Router();
import logger from '../logger.js';

import dotenv from "dotenv" // For .env file
dotenv.config();

// import Session from "../schemas/Session.js";
// import Student from "../schemas/Student.js";
import User from "../schemas/User.js";

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
        const user_id = req.user.id;
        const docs = await User.where({ id: user_id }).find();
        logger.debug(user_id);
        if (docs.length !== 1) {
            res.status(500).json({error: true, msg: "Internal server error"});
            return;
        }
        else {
            let user = docs[0];
            user.rate = rate;
            const response = await docs[0].overwrite(user).save();
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
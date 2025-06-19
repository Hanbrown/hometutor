/**
 * Router (accessed in server.js -- kept here for tidiness)
 * NOTE: To get over here, type "/api/items/[route]"
 **/

import express from "express";
const router = express.Router();
import logger from '../logger.js';

import passport from "passport";
import session from "express-session";
import Strategy from "passport-google-oauth20/lib/strategy.js";

import dotenv from "dotenv" // For .env file
dotenv.config();

// import Session from "../schemas/Session.js";
// import Student from "../schemas/Student.js";
import User from "../schemas/User.js";

// router.post("/add", (req, res) => {
//     logger.debug(req.body);
//     res.
// })

export default router;
/**
 * Router (accessed in server.js -- kept here for tidiness)
 * NOTE: To get over here, type "/api/items/[route]"
 **/

import express from "express";
const router = express.Router();

import Session from "../schemas/Session.js";
import Student from "../schemas/Student.js";
import User from "../schemas/User.js";

export default router;
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv" // For .env file
dotenv.config();

// Models for MongoDB
import sessions from "./api/sessions.js";
import students from "./api/students.js";
import users from "./api/users.js";
import logger from './logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(bodyParser.json());

/** Connect to Database **/
// Connection URI
const db = process.env.MONGO_URI;
mongoose
    .connect(db)
    // If connection is successful
    .then(() => {
        logger.info("Mongo Connected");
    })
    // If error occurs during connection
    .catch(err => {
        logger.error("Mongo Error");
        logger.error(`Error: ${err}`);
    });

/** Use routes (declared earlier in this file) **/
app.use("/api/sessions", sessions);
app.use("/api/students", students);
app.use("/api/users", users);

// Set a static asset folder
app.use(express.static("build"));

app.get("/", (req, res) => {
    res.sendFile(resolve(__dirname, "build", "index.html"));
});

app.get("/manage/:student", (req, res) => {
    res.sendFile(resolve(__dirname, "build", "manage.html"));
});


/** Start server **/
const port = process.env.PORT || 8081;
app.listen(port, () => logger.info(`Server running on port ${port}`));

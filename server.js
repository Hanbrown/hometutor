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

import passport from "passport";
import session from "express-session";
import Strategy from "passport-google-oauth20/lib/strategy.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(bodyParser.json());

const port = process.env.PORT || 8081;

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
app.use("/auth", users);

// Set a static asset folder
app.use(express.static("build"));

/** Sessions and Strategy **/
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

passport.use(
    new Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `http://localhost:${port}/api/auth/google/callback`,
        scope: ['profile', 'email'],
        failureRedirect: "/",
    }, 
    (accessToken, refreshToken, profile, done) => {
        // TODO: Save to mongo
        return done(null, profile);
    })
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(passport.initialize());
app.use(passport.session());


app.get("/", (req, res) => {
    logger.info("Index reached");
    if (req.isAuthenticated()) {
        logger.info("Index is authenticated");
    }
    res.sendFile(resolve(__dirname, "build", "index.html"));
});

app.get("/landing", (req, res) => {
    if (req.isAuthenticated()) {
        logger.debug("Logged in");
        res.sendFile(resolve(__dirname, "build", "landing.html"));
        return;
    }
    else {
        logger.debug("Landing Redirecting...");
        res.redirect("/");
        return;
    }
    
});

app.get("/manage/:student", (req, res) => {
    logger.debug("Manage route reached");
    if (req.isAuthenticated()) {
        res.sendFile(resolve(__dirname, "build", "manage.html"));
    }
    else {
        logger.debug("Manage Redirecting...");
        res.redirect("/");
    }
});

app.get("/api/auth/google", passport.authenticate("google"));

app.get("/api/auth/google/callback", passport.authenticate("google", {failureRedirect: "/"}), (req, res) => {
    res.redirect("/landing");
});

app.get("/api/auth/logout", (req, res) => {
    res.clearCookie("username");
    res.clearCookie("email");
    req.logout(() => {
        res.redirect("/");
    });
});

/** Start server **/
app.listen(port, () => logger.info(`Server running on port ${port}`));

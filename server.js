// Basics for express and mongo
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";

// For authentication
import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo";
import Strategy from "passport-google-oauth20/lib/strategy.js";

// Utilities
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv" // For .env file
dotenv.config();

import logger from './logger.js';

// Routes and schemas
import sessions from "./api/sessions.js";
import students from "./api/students.js";
import users from "./api/users.js";

import User from "./schemas/User.js";
import Student from "./schemas/Student.js";

// Setup
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

// Set a static asset folder
app.use("/assets", express.static("build/assets"));

/** Sessions **/
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
        },
        sameSite: true,
        secure: process.env.NODE_ENV === "production",
        store: MongoStore.create(
            {
                client: mongoose.connection.getClient(),
                collectionName: String(process.env.MONGO_SESSION_STORE),
                autoRemove: "interval",
                autoRemoveInterval: 10 // minutes
            }
        )
    })
);

/** Passport JS **/
passport.use(
    new Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `/api/auth/google/callback`,
        scope: ['profile', 'email'],
        failureRedirect: "/",
    }, 
    async (accessToken, refreshToken, profile, done) => {

        // Create user JSON object
        const id = profile.id.toString();
        const username = profile.displayName;
        const email = profile.emails[0].value;

        // Check if email is allowed
        const allowlist = process.env.ALLOWLIST.split(",");
        if (allowlist.indexOf(email) === -1) {
            logger.error("User not allowed");
            return done(null, null);
        }

        let the_user;

        // Check if user exists, create new if it doesn't
        const doc = await User.where({ id: id }).findOne();
        // console.log(doc);
        if (doc === null) {
            logger.info("No user found, creating a new one");
            const newUser = User({id, username, email});
            const response = await newUser.save();

            the_user = {
                id: response.id,
                username: response.username,
                email: response.email,
                rate: response.rate
            };
        }
        // User exists, so send it
        else {
            logger.info("User found");
            the_user = {
                id: doc.id,
                username: doc.username,
                email: doc.email,
                rate: doc.rate
            };
        }

        return done(null, the_user);
    })
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(passport.initialize());
app.use(passport.session());

/** Use routes (declared earlier in this file) Must be after app.use(passport) **/
app.use("/api/sessions", sessions);
app.use("/api/students", students);
app.use("/api/users", users);

const auth = (req, res, next) => {
    if (process.env.NODE_ENV === "production") {
        if (req.isAuthenticated()) {
            logger.info("Logged in");
            next();
        }
        else {
            logger.warn("Forbidden");
            res.redirect("/forbidden");
        }
    }
    else {
        next()
    }
}

/** Routes **/
app.get("/", (req, res) => {
    logger.info("Index reached");
    if (req.isAuthenticated()) {
        logger.info("Index is authenticated");
        res.redirect("/landing");
        return;
    }
    else {
        res.clearCookie("displayName");
        res.clearCookie("rate");
    }
    res.sendFile(resolve(__dirname, "build", "index.html"));
});

app.get("/landing", auth, (req, res) => {
    res.header('Cache-Control', 'no-store');
    res.clearCookie("student");
    res.sendFile(resolve(__dirname, "build", "landing.html"));
    return;
});

app.get("/manage", auth, (req, res) => {
    res.redirect("/landing");
});

app.get("/manage/:student", auth, async (req, res) => {
    logger.debug("Manage route reached");
    if (await Student.exists({ id_short: req.params.student, user: req.user.id }) !== null) {
        res.header('Cache-Control', 'no-store');
        res.cookie("student", req.params.student.toString());
        res.sendFile(resolve(__dirname, "build", "manage.html"));
        return;
    }
    else {
        logger.warn("Unauthorized student view attempted");
        res.redirect("/landing");
    }
});

app.get("/forbidden", (req, res) => {
    res.sendFile(resolve(__dirname, "build", "forbidden.html"));
});

app.get("/logout", (req, res) => {
    res.sendFile(resolve(__dirname, "build", "logout.html"));
});

/** Auth routes, TODO move these to a separate file **/
app.get("/api/auth/google", passport.authenticate("google"));

// This route path is written in Google Cloud
app.get("/api/auth/google/callback", passport.authenticate("google", {failureRedirect: "/forbidden"}), (req, res) => {
    logger.info(req.get("referer"));
    res.cookie("displayName", req.user.username);
    res.cookie("rate", req.user.rate);
    res.redirect("/landing");
});

app.get("/api/auth/logout", (req, res) => {
    // Clear cookies
    res.clearCookie("student");
    res.clearCookie("displayName");
    res.clearCookie("rate");

    // Clear connect.sid variable in client
    req.session.cookie.expires = new Date(Date.now());

    // Clear Session
    logger.debug(JSON.stringify(req.session));
    req.session.save((err) => {
        if (err) {
            logger.error(err);
        }

        req.session.regenerate((err) => {
            if (err) {
                logger.error(err);
            }
            else {
                logger.info("Signed out");
            }
            res.redirect("/logout");
        });
    });
});

/** Start server **/
app.listen(port, () => logger.info(`Server running on port ${port} on ${process.env.NODE_ENV}`));

export default app;

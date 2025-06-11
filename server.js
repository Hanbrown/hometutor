import express from "express";
import mongoose from "mongoose";

import { dirname, resolve } from "node:path";

import dotenv from "dotenv" // For .env file
dotenv.config();

const app = express();

/** Connect to Database **/
// Connection URI
// const db = process.env.MONGO_URI;
// mongoose
//     .connect(db)
//     // If connection is successful
//     .then(() => {
//         console.log("Mongo Connected");
//     })
//     // If error occurs during connection
//     .catch(err => {
//         console.log(`Error: ${err}`);
//     });

/** Use routes (declared earlier in this file) **/
// app.use("/api/auth", auth);

// Set a static asset folder
app.use(express.static("build"));

app.get("/", (req, res) => {
    res.sendFile(resolve("build", "index.html"));
});

app.get("/manage/:student", (req, res) => {
    res.sendFile(resolve("build", "manage.html"));
});


/** Start server **/
const port = process.env.PORT || 8081;
app.listen(port, () => console.log(`Server running on port number ${port}`));

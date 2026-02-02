import express from "express";

import dotenv from "dotenv";

import { clerkMiddleware } from '@clerk/express'

import fileupload from "express-fileupload";

import path from "path";

import cors from "cors";

import { createServer } from "http";

import {initializeSocket} from "./lib/socket.js";

import { connectDB } from "./lib/db.js";

import cron from "node-cron"

import fs from "fs";

import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import authRoutes from "./routes/auth.route.js";
import songRoutes from "./routes/song.route.js";
import albumRoutes from "./routes/album.route.js";
import statRoutes from "./routes/stat.route.js";


dotenv.config();

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT;

const httpServer = createServer(app);
initializeSocket(httpServer);

app.use(cors(
    {
        origin: "http://localhost:3000",
        credentials: true,
    }
));

app.use(express.json()); //to parse req.body(json.data)

app.use(clerkMiddleware()); //this will add auth to req obj => req.body.userid

app.use(fileupload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "temp"),
    createParentPath: true,
    limits:{
        fileSize: 10 * 1024 * 1024, //10mb max file size
    },
})
);

app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);

if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")))
    app.get("/*", (req,res) => {
        res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
    })
}

// cron jobs are used to automatically delete the temp folder every 1hr, 10mins watever
const tempDir = path.join(process.cwd(), "tmp")
cron.schedule("0 * * * *", () => {
    if (fstat.existsSync(tempDir)) {
        fstat.readdir(tempDir, (err,files) => {
            if (err) {
                console.log("error", err);
                return;
            }
            for (const file of files) {
                fs.unlink(path.join(tempDir, file) ,(err) => {})
            }
        })
    }
})


app.use((err,req,res,next) => {
    res.status(500).json({message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message});
})

// app.listen(PORT, () => {
//     console.log("Server is running on port " + PORT);
//     connectDB();
// })

// no more app but server will be listening
httpServer.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
    connectDB();
});
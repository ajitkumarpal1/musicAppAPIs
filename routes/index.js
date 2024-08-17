import express from "express";
import usersRouter from './users.js';
import { songRouter } from "./song.js";


const router = express.Router();

console.log('Router loaded');

// Redirecting all requests starting with '/api/users' to the 'usersRouter'
router.use('/api/users', usersRouter);
router.use('/api/song', songRouter);
// Handling all other requests
router.use('*', (req, res) => {
    res.status(400).json({ error: "Bad request" });
});

export default router;

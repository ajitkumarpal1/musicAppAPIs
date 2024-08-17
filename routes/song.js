import express from "express";
import { auth } from "../middlewares/auth.js";
import { songService } from "../src/controllers/song_controller.js";


export const songRouter = express.Router();

songRouter.get("/list",songService.list)
songRouter.get("/song-by-id/:songId",songService.getSongById)
songRouter.use(auth)
songRouter.post("/push-song-in-playlist",songService.pushSongInPlaylist)
songRouter.post("/create-play-list",songService.createPlayList)
songRouter.get("/get-play-list",songService.getPlayList)


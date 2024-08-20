import axios from "axios";
import PlayList from "../models/playList.js";
import json from '../../resources/song.json' assert { type: 'json' };
import mongoose from "mongoose";
import songScima from "../models/allSongs.js";


export const songService = {
  getSongById: async (req, res, next) => {
    try {
      const songId = req.params.songId;
      const song = await songScima.findOne({ id: songId })
      if (!song) {
        return res.status(404).json({ success: false, message: "Song not found" });
      }
      res.status(200).json(song)
    } catch (error) {
      res.status(201).json(error)
    }
  },
  pushSongInPlaylist: async (req, res, next) => {
    try {
      const { playlistId, songId } = req.body;

      // Ensure playlistId and songId are provided
      if (!playlistId || !songId) {
        return res.status(400).json({ message: 'Playlist ID and Song ID are required' });
      }

      // Validate playlistId
      if (!mongoose.isValidObjectId(playlistId)) {
        return res.status(400).json({ message: 'Invalid Playlist ID' });
      }

      // Find the playlist to check if the song is already in the playlist
      const playlist = await PlayList.findById(playlistId);

      if (!playlist) {
        return res.status(404).json({ message: 'Playlist not found' });
      }

      // Check if the song is already in the playlist
      if (playlist.songList.includes(songId)) {
        return res.status(400).json({ message: 'Song is already in the playlist' });
      }

      // Update the playlist by pushing the song ID into the songList array
      playlist.songList.push(songId);
      let updatedPlaylist = await playlist.save()
      /* updatedPlaylist.lean();
      updatedPlaylist.id = songId */

      // Respond with the updated playlist
      res.status(200).json(updatedPlaylist);
    } catch (error) {
      next(error); // Pass the error to the error handling middleware
    }
  },
  // Function to create a new playlist
  createPlayList: async (req, res, next) => {
    try {
      let { userId, name, description } = req.body;
      if (!userId) {
        userId = req.user["_id"].toString()
      }
      // Check if a playlist with the same name already exists for this user
      const existingPlaylist = await PlayList.findOne({ userId, name });
      if (existingPlaylist) {
        return res.status(400).json({ message: "Playlist with this name already exists." });
      }

      // Create a new playlist
      const newPlayList = new PlayList({ userId, name, description });
      await newPlayList.save();

      res.status(201).json(newPlayList);
    } catch (error) {
      next(error); // Pass the error to the error handling middleware
    }
  },
  getPlayList: async (req, res, next) => {
    try {

      const userId = req.query.userId || req.user["_id"].toString();
      if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
      }

      // Retrieve playlists for the specified user
      const playlists = await PlayList.find({ userId }).lean();

      // Check if playlists exist
      if (!playlists.length) {
        return res.status(404).json({ message: "No playlists found for this user." });
      }

      res.status(200).json(playlists);
    } catch (error) {
      next(error); // Pass the error to the error handling middleware
    }
  },

  // Function to retrieve the list of songs from a proxy service
  list: async (req, res, next) => {
    try {
      /* const response = await axios.get("https://proxydeezer.onrender.com/chart");
      let songs = response.data.tracks.data; */
      // Fetch all songs without populate since 'artist' is an embedded object
      const allSongs = await songScima.find({}).lean();

      // Log the first song to check the data structure
      console.log(allSongs[0]);

      // Return the songs in the response
      res.status(200).json(allSongs);
    } catch (error) {
      next(error); // Pass the error to the error handling middleware
    }
  }
};

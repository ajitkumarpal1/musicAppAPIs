import mongoose from "mongoose";

// Define the PlayList schema
const playListSchema = new mongoose.Schema({
  // Reference to the user who owns the playlist
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Ensure this matches the name of your User model
    required: true
  },
  // Name of the playlist
  name: {
    type: String,
    required: true,
    trim: true,
  },
  // Array of song IDs
  songList: [{ type: String  }],
  // Description of the playlist
  description: {
    type: String,
    trim: true
  },
  // Timestamp for when the playlist was created
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index to ensure uniqueness of the combination of userId and name
// playListSchema.index({ userId: 1, name: 1 }, { unique: true });

// Create and export the PlayList model
const PlayList = mongoose.model("PlayList", playListSchema);
export default PlayList;

import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  title: String,
  title_short: String,
  title_version: String,
  link: String,
  duration: Number,
  rank: Number,
  explicit_lyrics: Boolean,
  explicit_content_lyrics: Number,
  explicit_content_cover: Number,
  preview: String,
  md5_image: String,
  position: Number,
  artist: {
    id: Number,
    name: String,
    link: String,
    picture: String,
    picture_small: String,
    picture_medium: String,
    picture_big: String,
    picture_xl: String,
    radio: Boolean,
    tracklist: String,
    type: String
  },
  album: {
    id: Number,
    title: String,
    cover: String,
    cover_small: String,
    cover_medium: String,
    cover_big: String,
    cover_xl: String,
    md5_image: String,
    tracklist: String,
    type: String
  },
  type: String
});

const songScima = mongoose.model('Song', songSchema);

export default songScima;

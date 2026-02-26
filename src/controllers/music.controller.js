import musicModel from "../models/music.model.js";
import { uploadFile } from "../services/storage.service.js";
import albumModel from "../models/album.model.js";

async function getAllMusic(req, res) {
  let musics;
  try {
    musics = await musicModel.find().populate("artist", "username email");
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }

  const musicList = musics.map((music) => ({
    id: music._id,
    title: music.title,
    uri: music.uri,
    artist: music.artist,
  }));

  res.status(200).json({
    success: true,
    message: "Musics retrieved successfully",
    musics: musicList,
  });
}

async function createMusic(req, res) {
  const { title } = req.body;
  const file = req.file;

  const result = await uploadFile(file.buffer.toString("base64"));

  if (!result) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload music",
    });
  }

  // APPROACH IN USE — two-step: create instance then save to DB
  // Useful when you need to access the object (e.g. music._id) before saving,
  // or when you want to run custom logic between creation and saving.
  const music = new musicModel({
    uri: result.url,
    title: title,
    artist: req.user.id,
  });

  await music.save();

  // ─────────────────────────────────────────────────────────────────
  // ALTERNATIVE — musicModel.create() (one-step shorthand, same result)
  // Internally does `new musicModel({...}).save()` for you.
  //
  // const music = await musicModel.create({
  //   uri: result.url,
  //   title: title,
  //   artist: req.user.id,
  // });
  // ─────────────────────────────────────────────────────────────────

  res.status(201).json({
    success: true,
    message: "Music created successfully",
    music: {
      id: music._id,
      title: music.title,
      uri: music.uri,
      artist: music.artist,
    },
  });
}

async function getAllAlbums(req, res) {
  let albums;
  try {
    albums = await albumModel
      .find()
      .limit(4)
      .populate("artist", "username email")
      .populate("music", "title uri");
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }

  const albumList = albums.map((album) => ({
    id: album._id,
    title: album.title,
    artist: album.artist,
    music: album.music,
  }));

  res.status(200).json({
    success: true,
    message: "Albums retrieved successfully",
    albums: albumList,
  });
}

async function getAlbumById(req, res) {
  const { albumId } = req.params;

  let album;
  try {
    album = await albumModel
      .findById(albumId)
      .populate("artist", "username email")
      .populate("music", "title uri");
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }

  if (!album) {
    return res.status(404).json({
      success: false,
      message: "Album not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Album retrieved successfully",
    album: {
      id: album._id,
      title: album.title,
      artist: album.artist,
      music: album.music,
    },
  });
}

async function createAlbum(req, res) {
  const { title, musics } = req.body;

  const album = new albumModel({
    title: title,
    artist: req.user.id,
    music: musics,
  });

  await album.save();

  res.status(201).json({
    success: true,
    message: "Album created successfully",
    album: {
      id: album._id,
      title: album.title,
      artist: album.artist,
      music: album.music,
    },
  });
}

export { createMusic, createAlbum, getAllMusic, getAllAlbums, getAlbumById };

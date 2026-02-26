import express from "express";
import {
  createAlbum,
  createMusic,
  getAllMusic,
  getAllAlbums,
  getAlbumById,
} from "../controllers/music.controller.js";
import multer from "multer";
import { validateUser } from "../middlewares/validate.middleware.js";
import {
  createMusicSchema,
  createAlbumSchema,
} from "../validations/music.validation.js";
import { authArtist, authUser } from "../middlewares/auth.middleware.js";

const upload = multer({
  storage: multer.memoryStorage(),
});

const router = express.Router();

router.get("/", authUser, getAllMusic);

router.post(
  "/upload",
  authArtist,
  upload.single("music"),
  validateUser(createMusicSchema),
  createMusic,
);

//           route        auth           validate body              controller
router.post("/album", authArtist, validateUser(createAlbumSchema), createAlbum);

router.get("/album", authArtist, getAllAlbums);

router.get("/album/:albumId", authUser, getAlbumById);

export default router;

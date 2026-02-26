import { z } from "zod";

const createMusicSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .min(1, "Title cannot be empty")
    .max(100, "Title must be at most 100 characters long")
    .trim(),
});

const createAlbumSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .min(1, "Title cannot be empty")
    .max(100, "Title must be at most 100 characters long")
    .trim(),

  musics: z
    .array(z.string().min(1))
    .min(1, "Album must have at least one track")
    .max(25, "Album can have at most 25 tracks"),
});

export { createMusicSchema, createAlbumSchema };

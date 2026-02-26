import { z } from "zod";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(35, "Username must be at most 35 characters long")
    .trim(),

  email: z.string().email("Invalid email format").trim().toLowerCase(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password must be at most 100 characters long"),
});

const loginSchema = z
  .object({
    email: z
      .string()
      .email("Invalid email format")
      .trim()
      .toLowerCase()
      .optional(),
    username: z.string().trim().optional(),
    password: z.string().min(1, "Password is required"),
  })
  .refine((data) => data.email || data.username, {
    message: "Either email or username is required",
  });

export { registerSchema, loginSchema };

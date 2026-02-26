import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import musicRoutes from "./routes/music.routes.js";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.use("/api/music", musicRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  if (err.type === "entity.parse.failed") {
    return res
      .status(400)
      .json({ success: false, message: "Invalid JSON body" });
  }
  res.status(500).json({ success: false, message: "Internal server error" });
});

export default app;

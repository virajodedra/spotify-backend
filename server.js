import app from "./src/app.js";
import connectDB from "./src/db/db.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 4000;
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

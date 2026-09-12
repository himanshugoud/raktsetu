import "dotenv/config";
import "./instrument.js"; // must run before app.js is imported
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`RaktSetu API running on port ${PORT}`));
});
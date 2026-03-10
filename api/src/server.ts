import express from "express";
import dotenv from "dotenv";

import adminRoutes from "./routes/admin.js";
import priceRoutes from "./routes/price.js";
import healthRoutes from "./routes/health.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/admin", adminRoutes);
app.use("/price", priceRoutes);
app.use("/", healthRoutes);

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
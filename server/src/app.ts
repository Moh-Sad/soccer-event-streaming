import express from "express";
import adminRoutes from "./routes/admin.routes";
import matchRoutes from "./routes/user.routes";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/admin", adminRoutes);
app.use("/api/", matchRoutes);

const PORT = 8000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

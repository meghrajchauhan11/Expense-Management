import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Example GET route
app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from your backend API!" });
});

// Example POST route
app.post("/api/echo", (req, res) => {
  res.json({ youSent: req.body });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));

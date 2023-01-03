import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("yes the server is working");
});

const port = process.env.PORT || 3000;

// iife for future async stuff
(async () => {
  app.listen(3000, () => {
    console.log(`listening on port ${port}`);
  });
})();

import { Router } from "express";

const router = Router();

router.post("/", async (req, res) => {
  console.log("auth route");
});

export default router;

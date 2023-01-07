import { Router } from "express";
import { z } from "zod";
import { loginUser, signUpUser } from "../controllers/auth.controller.js";

// regex to check if a string has 1 uppercase letter
const authSchema = z
  .object({
    action: z.enum(["login", "signup"]),
    login: z.string().min(4).max(20),
    password: z
      .string()
      .min(6)
      .max(64)
      .refine(
        (val) => /[A-Z]/.test(val),
        "password must contain at least 1 uppercase letter"
      )
      .refine(
        (val) => /[a-z]/.test(val),
        "password must contain at least 1 lowercase letter"
      )
      .refine(
        (val) => /[0-9]/.test(val),
        "password must contain at least 1 number"
      ),
  })
  .strict();

const router = Router();

router.post("/", async (req, res) => {
  const authData = authSchema.safeParse(req.body);
  if (!authData.success) {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid request" });
  }
  const { login, password, action } = authData.data;
  if (action === "login") {
    const result = await loginUser(login, password);
    if (result) {
      return res
        .status(200)
        .json({ status: "success", message: "login successful" });
    } else {
      return res.status(401).json({
        status: "error",
        message: "username or password is incorrect",
      });
    }
  } else {
    const result = await signUpUser(login, password);
    if (!result)
      return res
        .status(409)
        .send({ status: "error", message: "user already exists" });
  }
  res.send("ok");
});

export default router;

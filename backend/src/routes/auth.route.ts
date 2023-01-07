import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../app.js";
import { z } from "zod";
import { signUpUser } from "../controllers/auth.controller.js";

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

// a single /auth route
router.post("/", async (req, res) => {
  const authData = authSchema.safeParse(req.body);
  if (!authData.success) {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid request" });
  }
  const { login, password, action } = authData.data;
  if (action === "login") {
    const foundUser = await prisma.user.findUnique({
      where: { username: login },
    });
    // we will not make a distinction between user not found
    // and password is incorrect
    if (!foundUser)
      return res.status(401).json({
        status: "error",
        message: "username or password is incorrect",
      });
    const passwordVerified = await bcrypt.compare(password, foundUser.password);
    if (passwordVerified) {
      // todo: create jwt here
      // setting a field to undefined makes the object not include the said field
      const userToSend = { ...foundUser, password: undefined };
      return res.status(200).json({ status: "success", user: userToSend });
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
});

export default router;

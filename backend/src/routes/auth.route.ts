import { Router } from "express";
import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { prisma } from "../app.js";
import { z } from "zod";
import { signUpUser } from "../controllers/auth.controller.js";

// a schema for logging in with a login and a password
const loginSchema = z
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
// a schema for authentication through a jwt token
const authSchema = z
  .object({
    userId: z.number().nonnegative(),
    token: z.string(),
  })
  .strict();

// make sure to set the JWT_SECRET environment variable
// in ./.env file
const createJwt = (userId: number) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "secret", {
    expiresIn: "3d",
  });
};

const router = Router();

// a single route for login and signup using credentials
// /auth
router.post("/", async (req, res) => {
  const authData = loginSchema.safeParse(req.body);
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
      const token = createJwt(userToSend.id);
      return res
        .status(200)
        .json({ status: "success", user: userToSend, token });
    } else {
      return res.status(401).json({
        status: "error",
        message: "username or password is incorrect",
      });
    }
  } else {
    const result = await signUpUser(login, password);
    if (result === null)
      return res
        .status(409)
        .send({ status: "error", message: "user already exists" });
    // setting a field to undefined makes the object not include the said field
    const userToSend = { ...result, password: undefined };
    const token = createJwt(userToSend.id);
    return res.json({ status: "success", user: userToSend, token });
  }
});

// a route to initially verify the login through the jwt token
// /auth/verify
router.post("/verify", (req, res) => {
  const authData = authSchema.safeParse(req.body);
  if (!authData.success) {
    return res
      .status(400)
      .json({ status: "error", message: "request is invalid" });
  }
  const { userId, token } = authData.data;
  let result: JwtPayload & { userId?: number };
  try {
    result = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      return res
        .status(403)
        .json({ status: "error", message: "auth token is invalid" });
    }
    console.error(e);
    return res
      .status(500)
      .json({ status: "error", message: "server side error" });
  }
  // jwt issue validity is verified
  // for the rare case where there is no user id specified in the token
  // (invalid sign)
  if (!result.userId)
    return res
      .status(401)
      .json({ status: "error", message: "auth token is invalid" });
  // now we know that jwt is fully valid
  res.json({ status: "success", userId });
});

export default router;

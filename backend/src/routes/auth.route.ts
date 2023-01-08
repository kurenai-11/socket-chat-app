import { Router } from "express";
import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { prisma } from "../app.js";
import { z } from "zod";
import { signUpUser } from "../controllers/auth.controller.js";
import { User } from "@prisma/client";

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
    refreshToken: z.string(),
  })
  .strict();

const createJwt = (userId: number, type: "access" | "refresh") => {
  return jwt.sign(
    { userId },
    type === "access"
      ? process.env.JWT_ACCESS_SECRET!
      : process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: type === "access" ? "5m" : "3d",
    }
  );
};

// a place to remove unwanted fields from the data we will send to the client
// setting a field to undefined makes it so the field
// will not be included in the response
const createUserToSend = (user: User) => {
  return { ...user, password: undefined, invalidRefreshTokens: undefined };
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
      const userToSend = createUserToSend(foundUser);
      const accessToken = createJwt(userToSend.id, "access");
      const refreshToken = createJwt(userToSend.id, "refresh");
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 72 * 60 * 60 * 1000),
      });
      return res
        .status(200)
        .json({ status: "success", user: userToSend, accessToken });
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
    const userToSend = createUserToSend(result);
    const accessToken = createJwt(userToSend.id, "access");
    const refreshToken = createJwt(userToSend.id, "refresh");
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 72 * 60 * 60 * 1000),
    });
    return res.json({ status: "success", user: userToSend, accessToken });
  }
});

// a route to verify a refresh token and issue a new access token
// /auth/verify
router.post("/verify", async (req, res) => {
  const authData = authSchema.safeParse(req.body);
  if (!authData.success) {
    return res
      .status(400)
      .json({ status: "error", message: "request is invalid" });
  }
  const { refreshToken } = authData.data;
  let result: JwtPayload & { userId?: number };
  try {
    result = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as JwtPayload;
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      return res
        .status(403)
        .json({ status: "error", message: "refresh token is invalid" });
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
      .json({ status: "error", message: "refresh token is invalid" });
  // now we know that the refresh token is fully valid
  const foundUser = await prisma.user.findUnique({
    where: { id: result.userId },
  });
  if (!foundUser)
    return res.status(404).json({ status: "error", message: "user not found" });
  // if refreshToken is banned(user has logged out)
  if (foundUser.invalidRefreshTokens.includes(refreshToken)) {
    return res
      .status(403)
      .json({ status: "error", message: "refresh token is invalid" });
  }
  // issuing a new access token
  const accessToken = createJwt(result.userId, "access");
  const userToSend = createUserToSend(foundUser);
  res.json({ status: "success", user: userToSend, accessToken });
});

export default router;

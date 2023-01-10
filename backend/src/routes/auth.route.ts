import { Router } from "express";
import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { prisma } from "../app.js";
import { z } from "zod";
import {
  checkJwtMiddleware,
  jwtTokenPayload,
  signUpUser,
} from "../controllers/auth.controller.js";
import { User } from "@prisma/client";
import { createJwt } from "../controllers/auth.controller.js";

const validUsernameRegex = /[a-zA-Z0-9\-_]/g;
// a schema for logging in with a login and a password
const loginSchema = z
  .object({
    action: z.enum(["login", "signup"]),
    login: z
      .string()
      .min(4)
      .max(20)
      .refine(
        (val) => val.match(validUsernameRegex)?.length === val.length,
        "username must only contain lowercase, uppercase letters, numbers and -_"
      ),
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
      const accessToken = createJwt(
        {
          userId: userToSend.id,
          username: foundUser.username,
          displayName: foundUser.displayName,
        },
        "access"
      );
      const refreshToken = createJwt(
        {
          userId: userToSend.id,
          username: foundUser.username,
          displayName: foundUser.displayName,
        },
        "refresh"
      );
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 72 * 60 * 60 * 1000),
        sameSite: false,
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
    const accessToken = createJwt(
      {
        userId: userToSend.id,
        username: result.username,
        displayName: result.displayName,
      },
      "access"
    );
    const refreshToken = createJwt(
      {
        userId: userToSend.id,
        username: result.username,
        displayName: result.displayName,
      },
      "refresh"
    );
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 72 * 60 * 60 * 1000),
      sameSite: false,
    });
    return res.json({ status: "success", user: userToSend, accessToken });
  }
});

// logout route
// /auth/logout
router.post("/logout", checkJwtMiddleware, async (req, res) => {
  // we are sure that about the identity of the user because of the middleware now
  // clear the refresh token
  const refreshToken = req.cookies.jwt;
  // this is for the strange, rare case where the user has deleted
  // the refresh token by themselves for some reason
  // while still having a valid access token in the memory
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // we already verified the access token and appended it as a "user" header
  // in the checkJwtMiddleware function
  const userData: jwtTokenPayload = JSON.parse(req.headers.user! as string);
  const foundUser = await prisma.user.findUnique({
    where: { id: userData.userId },
  });
  // if the user was deleted entirely already...
  if (!foundUser) {
    return res.status(400).json({ message: "User does not exist" });
  }
  // invalidating the refresh token
  await prisma.user.update({
    where: { id: userData.userId },
    data: { invalidRefreshTokens: { push: refreshToken } },
  });
  res.clearCookie("jwt");
  res.send("ok");
});

export default router;

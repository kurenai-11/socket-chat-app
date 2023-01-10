import { prisma } from "../app.js";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// data we need to sign the token with
export interface UserIdentity {
  userId: number;
  username: string;
  displayName: string;
}
// the containing data our jwt token will have
export interface jwtTokenPayload extends JwtPayload, Partial<UserIdentity> {}

export const createJwt = (user: UserIdentity, type: "access" | "refresh") => {
  const { userId, username, displayName } = user;
  return jwt.sign(
    { userId, username, displayName },
    type === "access"
      ? process.env.JWT_ACCESS_SECRET!
      : process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: type === "access" ? "30s" : "3d",
    }
  );
};

export const signUpUser = async (
  login: string,
  password: string
): Promise<User | null> => {
  const hashedPassword = await bcrypt.hash(password, 12);
  try {
    const result = await prisma.user.create({
      data: { username: login, password: hashedPassword, displayName: login },
    });
    return result;
  } catch (err) {
    // if there is an error, that means  that the user already exists
    // uniqueness constraint on the field username failed
    // there would be no writes to the database in this case
    // so there is no need to do a separate query to check
    // if the user already exists, it will be done for us
    return null;
  }
};

// this will handle the validation of the refresh token also
const getNewAccessToken = async (refreshToken: string) => {
  try {
    const result: jwtTokenPayload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as JwtPayload;
    // this shouldn't happen
    if (!result.userId || !result.username || !result.displayName) return null;

    const foundUser = await prisma.user.findUnique({
      where: { id: result.userId },
    });
    if (!foundUser) {
      throw new Error("User not found");
    }
    if (foundUser.invalidRefreshTokens.includes(refreshToken)) {
      throw new Error("Invalid refresh token");
    }
    const newAccessToken = createJwt(
      {
        userId: result.userId,
        username: result.username,
        displayName: result.displayName,
      },
      "access"
    );
    return newAccessToken;
  } catch (e) {
    return null;
  }
};

// this is for checking both the access token and the refresh token
export const checkJwtMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const parts = req.headers.authorization.split(" ");
  if (parts.length !== 2) {
    return res.status(401).json({ message: "Invalid Authorization header" });
  }
  const scheme = parts[0];
  const token = parts[1];
  if (scheme !== "Bearer") {
    return res.status(401).json({ message: "Invalid Authorization header" });
  }
  // actually verifying the token
  try {
    const result = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    console.log("result :>> ", result);
    return next();
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      // refresh the access token through the refresh token
      const result = getNewAccessToken(token);
      if (!result) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }
      // append the new access token to the request
      req.headers.authorization = "Bearer " + result;
    }
    if (e instanceof jwt.JsonWebTokenError)
      return res.status(401).json({ error: "Unauthorized" });
  }
};

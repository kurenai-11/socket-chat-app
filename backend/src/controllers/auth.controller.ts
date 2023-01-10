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

// this will also handle the validation of the refresh token
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
export const checkJwtMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // if there is no authorization header
  // (for example when we do the request to persist the auth)
  // we will check the refresh token and create a new access token
  if (!req.headers.authorization) {
    // validation will happen in the function below
    const newAccessToken = await getNewAccessToken(req.cookies.jwt);
    if (newAccessToken) {
      req.headers.authorization = `Bearer ${newAccessToken}`;
      // creating user identity header
      req.headers["user"] = JSON.stringify(jwt.decode(newAccessToken));
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  }
  // if there is a header with an access token, check it
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
    const user = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    // attach the user with the user data to the custom header
    // so we can use it later if we need to
    req.headers["user"] = JSON.stringify(user);
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

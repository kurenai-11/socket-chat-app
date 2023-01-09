import { prisma } from "../app.js";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";

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

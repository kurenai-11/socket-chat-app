import { prisma } from "../app.js";
import bcrypt from "bcrypt";

export const loginUser = async (
  login: string,
  password: string
): Promise<boolean> => {
  const foundUser = await prisma.user.findUnique({
    where: { username: login },
  });
  // we will not make a distinction between user does not exist
  // and user password is incorrect
  if (!foundUser) return false;
  const result = await bcrypt.compare(password, foundUser.password);
  // to create jwt token here
  return result;
};

export const signUpUser = async (
  login: string,
  password: string
): Promise<boolean> => {
  const hashedPassword = await bcrypt.hash(password, 12);
  try {
    await prisma.user.create({
      data: { username: login, password: hashedPassword },
    });
    return true;
  } catch (err) {
    // if there is an error, that means  that the user already exists
    // uniqueness constraint on the field username failed
    // there would be no writes to the database in this case
    // so there is no need to do a separate query to check
    // if the user already exists, it will be done for us
    return false;
  }
};

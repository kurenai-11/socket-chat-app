-- CreateEnum
CREATE TYPE "Role" AS ENUM ('User', 'Moderator', 'Admin');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'User';

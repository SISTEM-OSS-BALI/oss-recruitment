/*
  Warnings:

  - You are about to drop the column `userId` on the `history_candidate` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `history_candidate` DROP FOREIGN KEY `history_candidate_userId_fkey`;

-- DropIndex
DROP INDEX `history_candidate_userId_fkey` ON `history_candidate`;

-- AlterTable
ALTER TABLE `history_candidate` DROP COLUMN `userId`;

/*
  Warnings:

  - You are about to drop the column `userId` on the `schedule_hired` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `schedule_hired` DROP FOREIGN KEY `schedule_hired_userId_fkey`;

-- DropIndex
DROP INDEX `schedule_hired_userId_fkey` ON `schedule_hired`;

-- AlterTable
ALTER TABLE `schedule_hired` DROP COLUMN `userId`,
    ADD COLUMN `meeting_link` VARCHAR(191) NULL;

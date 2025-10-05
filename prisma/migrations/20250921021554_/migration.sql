/*
  Warnings:

  - You are about to drop the column `stage` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `applicant` ADD COLUMN `stage` ENUM('NEW_APLICANT', 'SCREENING', 'INTERVIEW', 'HIRED', 'REJECTED', 'WAITING') NULL DEFAULT 'SCREENING';

-- AlterTable
ALTER TABLE `user` DROP COLUMN `stage`;

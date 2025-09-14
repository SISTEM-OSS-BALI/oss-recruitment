/*
  Warnings:

  - Added the required column `start_time` to the `schedule_interview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `schedule_interview` ADD COLUMN `meeting_link` VARCHAR(191) NULL,
    ADD COLUMN `start_time` DATETIME(3) NOT NULL;

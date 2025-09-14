/*
  Warnings:

  - Added the required column `start_time` to the `schedule_hired` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `schedule_hired` ADD COLUMN `start_time` DATETIME(3) NOT NULL;

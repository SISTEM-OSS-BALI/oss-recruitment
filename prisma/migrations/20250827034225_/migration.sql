/*
  Warnings:

  - Added the required column `location` to the `schedule_hired` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `schedule_hired` ADD COLUMN `location` ENUM('DENPASAR', 'SINGARAJA') NOT NULL;

/*
  Warnings:

  - Added the required column `is_online` to the `schedule_interview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `applicant` ADD COLUMN `mbti_test` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `schedule_interview` ADD COLUMN `is_online` BOOLEAN NOT NULL;

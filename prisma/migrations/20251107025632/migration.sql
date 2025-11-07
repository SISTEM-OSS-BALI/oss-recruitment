/*
  Warnings:

  - Added the required column `type` to the `question_base_screening` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `question_base_screening` ADD COLUMN `type` ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE') NOT NULL;

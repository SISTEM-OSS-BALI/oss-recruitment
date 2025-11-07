/*
  Warnings:

  - The values [FULL_TIME,PART_TIME,CONTRACT,INTERNSHIP,FREELANCE] on the enum `question_base_screening_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `question_base_screening` MODIFY `type` ENUM('TEAM_MEMBER', 'REFFERAL') NOT NULL;
